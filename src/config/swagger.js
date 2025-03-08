import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "AIQ API Documentation",
    description:
      "AIQ is an interactive quiz platform designed to help users assess their knowledge of Artificial Intelligence (AI) while learning and having fun.",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:5000/api", // ✅ Correct API base URL
      description: "Local development server",
    },
  ],
};

const outputFile = "./src/config/swagger-output.json";
const endpointsFiles = ["./src/routes/index.js"]; // Scan all routes

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc).then(
  () => {
    console.log("✅ Swagger documentation generated with correct base URL!");
  }
);
