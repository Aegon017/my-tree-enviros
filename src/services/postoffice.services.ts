import api from "./http-client";

export interface PostOffice {
  name: string;
  branch_type: string;
  delivery_status: string;
  circle: string;
  district: string;
  division: string;
  region: string;
  block: string;
  state: string;
  country: string;
  pincode: string;
}

export interface PostOfficeResponse {
  Message: string;
  Status: string;
  PostOffice: PostOffice[] | null;
}

// Backend simplified response is PostOffice[] directly if successful, empty if failed?
// Controller checks for "Success" internally and returns array of formatted POs.
// So backend returns PostOffice[] directly.

export const postOfficeService = {
  /**
   * Search post offices by pincode using backend API
   */
  async searchByPincode(pincode: string): Promise<PostOfficeResponse> {
    try {
      const response = await api.get<PostOffice[]>(`/address/post-offices`, {
        params: { pincode },
      });

      const data = response.data;

      // Adapt backend response to frontend expectation (PostOfficeResponse wrapper)
      // The current frontend component expects { Status: "Success", PostOffice: [...] }

      if (Array.isArray(data) && data.length > 0) {
        return {
          Message: "Success",
          Status: "Success",
          PostOffice: data,
        };
      }

      return {
        Message: "No records found",
        Status: "Error",
        PostOffice: null,
      };

    } catch (error) {
      console.error("Error fetching post office data:", error);
      return {
        Message: "Error fetching data",
        Status: "Error",
        PostOffice: null,
      };
    }
  },

  /**
   * Search post offices by post office name
   * NOTE: Backend doesn't seem to have a search-by-name endpoint yet, only index with pincode.
   * We will keep this as dummy or remove if unused. It appears unused in the form.
   */
  async searchByPostOffice(name: string): Promise<PostOfficeResponse> {
    // Not supported by backend yet
    return {
      Message: "Not supported",
      Status: "Error",
      PostOffice: null,
    };
  },
};
