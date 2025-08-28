import axiosInstance from "@/lib/axios";
import { CreateBuyOrderRequest, CreateBuyOrderResponse } from "../types";

const createBuyOrder = async (
  orderData: CreateBuyOrderRequest
): Promise<CreateBuyOrderResponse> => {
  try {
    const { data } = await axiosInstance.post("/trade/buy", orderData);

    return data;
  } catch (error: unknown) {
    console.error("Create buy order error:", error);

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
        "An error occurred while creating buy order.";
      throw new Error(errorMessage);
    }

    // กรณี error ที่ไม่ใช่ axios error
    throw new Error("An unexpected error occurred while creating buy order.");
  }
};

export default createBuyOrder;
export type { CreateBuyOrderRequest, CreateBuyOrderResponse };