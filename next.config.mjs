import withPlaiceholder from "@plaiceholder/next";

/**
 * @type {import('next').NextConfig}
 */
const config = {
  images: {
    domains: ["127.0.0.1", "arboraid.co"],
  },
};

export default withPlaiceholder(config);