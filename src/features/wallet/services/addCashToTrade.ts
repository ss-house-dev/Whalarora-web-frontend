import axiosInstance from "@/lib/axios";
import { AddCashResponse } from "../types";

const addCashToTrade = async (): Promise<AddCashResponse> => {
  try {
    const { data } = await axiosInstance.post("/trade/add-cash");

    if (typeof data === "string" || !data) {
      return {
        success: true,
        message: "เพิ่มเงิน 10,000 บาทสำเร็จ",
        data: {
          amount: 10000,
        },
      };
    }

    return data;
  } catch (error: unknown) {
    console.error("Add cash error:", error);

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
        "An error occurred while adding money.";
      throw new Error(errorMessage);
    }

    // กรณี error ที่ไม่ใช่ axios error
    throw new Error("An unexpected error occurred while adding money.");
  }
};

export default addCashToTrade;
export type { AddCashResponse };
