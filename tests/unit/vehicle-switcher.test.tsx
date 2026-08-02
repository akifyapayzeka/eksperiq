import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VehicleSwitcher } from "@/components/vehicles/vehicle-switcher";
import type { VehicleProfile } from "@/lib/vehicles/types";

const vehicles: VehicleProfile[] = [
  { id: "v1", label: "Aracım", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "v2", label: "İkinci Arabam", createdAt: "2026-01-02T00:00:00.000Z" },
];

function renderSwitcher(onDelete = vi.fn()) {
  render(
    <VehicleSwitcher
      vehicles={vehicles}
      selectedVehicleId="v1"
      onSelect={vi.fn()}
      onAdd={vi.fn()}
      onRename={vi.fn()}
      onDelete={onDelete}
    />,
  );
  return onDelete;
}

describe("VehicleSwitcher delete confirmation", () => {
  it("does not delete immediately on the first click", () => {
    const onDelete = renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Bu aracı ve kayıtlarını sil" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText(/bu işlem geri alınamaz/i)).toBeInTheDocument();
  });

  it("only deletes after the user confirms", () => {
    const onDelete = renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Bu aracı ve kayıtlarını sil" }));
    fireEvent.click(screen.getByRole("button", { name: "Evet, sil" }));
    expect(onDelete).toHaveBeenCalledWith("v1");
  });

  it("cancels without deleting when the user backs out", () => {
    const onDelete = renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Bu aracı ve kayıtlarını sil" }));
    fireEvent.click(screen.getByRole("button", { name: "Vazgeç" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText(/bu işlem geri alınamaz/i)).not.toBeInTheDocument();
  });
});
