import axiosInstance from "@/lib/axios";

export interface CashBalance {
  userId: string;
  symbol: string;
  amount: number;
}

const getCashBalance = async (): Promise<CashBalance> => {
  try {
    const { data } = await axiosInstance.get("/trade/cash");
    return data;
  } catch (error: unknown) {
    console.error("Get cash balance error:", error);

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
        "An error occurred while fetching cash balance.";
      throw new Error(errorMessage);
    }

    // กรณี error ที่ไม่ใช่ axios error
    throw new Error("An unexpected error occurred while fetching cash balance.");
  }
};

export default getCashBalance;