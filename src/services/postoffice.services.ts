import api from "./http-client";

export interface PostOffice {
  Name: string;
  Description: string | null;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  State: string;
  Country: string;
  Pincode: string;
}

export interface PostOfficeResponse {
  Message: string;
  Status: string;
  PostOffice: PostOffice[] | null;
}

const INDIA_POST_API = "https://api.postalpincode.in";

export const postOfficeService = {
  /**
   * Search post offices by pincode
   */
  async searchByPincode(pincode: string): Promise<PostOfficeResponse> {
    try {
      const response = await fetch(`${INDIA_POST_API}/pincode/${pincode}`);
      const data = await response.json();
      // API returns an array with the response object as the first element
      return Array.isArray(data) && data.length > 0 ? data[0] : data;
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
   */
  async searchByPostOffice(name: string): Promise<PostOfficeResponse> {
    try {
      const response = await fetch(`${INDIA_POST_API}/postoffice/${name}`);
      const data = await response.json();
      // API returns an array with the response object as the first element
      return Array.isArray(data) && data.length > 0 ? data[0] : data;
    } catch (error) {
      console.error("Error fetching post office data:", error);
      return {
        Message: "Error fetching data",
        Status: "Error",
        PostOffice: null,
      };
    }
  },
};
