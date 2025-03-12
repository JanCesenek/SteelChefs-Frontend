import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ProductDetail from "./productDetail";
import { api } from "../core/api";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

vi.mock("../core/api");
vi.mock("uuid");
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

describe("ProductDetail Component", () => {
  const mockNavigate = vi.fn();
  const mockUpdateUnitQuantity = vi.fn();
  const mockUuid = "mock-uuid";

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    uuid.mockReturnValue(mockUuid);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    id: 1,
    title: "Test Product",
    description: "Test Description",
    img: "test.jpg",
    price: 100,
    quantity: 10,
    usersData: [{ id: 1, username: "testUser" }],
    imagesData: [
      { productID: 1, url: "test1.jpg" },
      { productID: 1, url: "test2.jpg" },
    ],
    unitsData: [],
    updateUnitQuantity: mockUpdateUnitQuantity,
    back: vi.fn(),
  };

  it("should call purchaseItem and update state correctly on successful purchase", async () => {
    api.post.mockResolvedValueOnce();
    api.patch.mockResolvedValueOnce();

    const { getByText, getByRole } = render(<ProductDetail {...defaultProps} />);

    fireEvent.change(getByRole("spinbutton"), { target: { value: 2 } });
    fireEvent.click(getByText("Purchase"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/ordered-units", {
        productID: 1,
        quantity: 2,
        uniqueID: mockUuid,
        userID: 1,
        orderID: mockUuid,
      });
      expect(api.patch).toHaveBeenCalledWith("/products/1", { quantity: 8 });
      expect(mockUpdateUnitQuantity).toHaveBeenCalledWith(2);
      expect(mockNavigate).toHaveBeenCalledWith("/cart");
    });
  });

  it("should handle error during purchase", async () => {
    api.post.mockRejectedValueOnce(new Error("Network Error"));

    const { getByText, getByRole } = render(<ProductDetail {...defaultProps} />);

    fireEvent.change(getByRole("spinbutton"), { target: { value: 2 } });
    fireEvent.click(getByText("Purchase"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/ordered-units", {
        productID: 1,
        quantity: 2,
        uniqueID: mockUuid,
        userID: 1,
        orderID: mockUuid,
      });
      expect(api.patch).not.toHaveBeenCalled();
      expect(mockUpdateUnitQuantity).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
