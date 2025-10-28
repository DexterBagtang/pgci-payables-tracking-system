import { useRef } from "react";
import domtoimage from "dom-to-image-more";
import { jsPDF } from "jspdf";

export default function InvoicePreview() {
    const invoiceRef = useRef();

    const generatePDF = () => {
        const element = invoiceRef.current;
        if (!element) return; // safety check

        domtoimage.toPng(element)
            .then((imgData) => {
                const pdf = new jsPDF("p", "mm", "a4");
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save("invoice.pdf");
            })
            .catch((err) => {
                // PDF generation failed
            });
    };

    return (
        <div>
            {/* ✅ Attach ref here */}
            <div
                ref={invoiceRef}
                style={{
                    padding: "32px",
                    backgroundColor: "#fff",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                    Invoice
                </h1>
                <p>Date: {new Date().toLocaleDateString()}</p>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "16px",
                    }}
                >
                    <thead>
                    <tr style={{ backgroundColor: "#e5e7eb" }}>
                        <th style={thStyle}>Item</th>
                        <th style={thStyle}>Qty</th>
                        <th style={thStyle}>Price</th>
                        <th style={thStyle}>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td style={tdStyle}>Laptop</td>
                        <td style={tdStyle}>1</td>
                        <td style={tdStyle}>$1200</td>
                        <td style={tdStyle}>$1200</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Mouse</td>
                        <td style={tdStyle}>2</td>
                        <td style={tdStyle}>$25</td>
                        <td style={tdStyle}>$50</td>
                    </tr>
                    <tr style={{ fontWeight: "bold" }}>
                        <td colSpan="3" style={{ ...tdStyle, textAlign: "right" }}>
                            Grand Total
                        </td>
                        <td style={tdStyle}>$1250</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <button
                onClick={generatePDF}
                style={{
                    marginTop: "16px",
                    padding: "8px 16px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                }}
            >
                Download PDF
            </button>
        </div>
    );
}

const thStyle = {
    padding: "8px",
    border: "1px solid #000",
    textAlign: "left",
};

const tdStyle = {
    padding: "8px",
    border: "1px solid #000",
};
