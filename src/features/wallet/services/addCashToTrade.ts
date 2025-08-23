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
  } catch (error: any) {
    console.error("Add cash error:", error);

    if (error?.response?.status === 401) {
      throw new Error("Please log in again");
    }

    const errorMessage =
      error?.response?.data?.message || "An error occurred while adding money.";
    throw new Error(errorMessage);
  }
};

export default addCashToTrade;
export type { AddCashResponse };
