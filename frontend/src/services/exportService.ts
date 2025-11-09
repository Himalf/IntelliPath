const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const exportService = {
  async exportCSV(datasetName: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export/csv/${datasetName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export CSV");
    }

    return response.blob();
  },

  async listDatasets() {
    const response = await fetch(`${API_BASE_URL}/export/datasets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to list datasets");
    }

    return response.json();
  },

  downloadCSV(datasetName: string) {
    this.exportCSV(datasetName)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${datasetName}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error("Export error:", error);
        throw error;
      });
  },
};
