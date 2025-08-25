import axiosInstance from "@/lib/axios";

export interface ResetPortfolioResponse {
  message: string;
}

const resetPortfolio = async (): Promise<ResetPortfolioResponse> => {
  try {
    const { data } = await axiosInstance.post("/trade/reset");
    return data;
  } catch (error: unknown) {
    console.error("Reset portfolio error:", error);

    // Type guard เพื่อตรวจสอบ error structure
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
      };

      if (axiosError.response?.status === 401) {
        throw new Error("Please log in again");
      }

      const errorMessage =
        axiosError.response?.data?.message ||
        "An error occurred while resetting portfolio.";
      throw new Error(errorMessage);
    }

    // กรณี error ที่ไม่ใช่ axios error
    throw new Error("An unexpected error occurred while resetting portfolio.");
  }
};

export default resetPortfolio;