from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
import os
from datetime import datetime

class InvoiceService:
    @staticmethod
    def generate_invoice_pdf(order_data: dict) -> bytes:
        """
        Generates a PDF invoice using ReportLab.
        In a production environment with S3, this byte stream would be uploaded 
        to the AWS S3 bucket and the URL saved to the Invoice database model.
        """
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Header
        c.setFont("Helvetica-Bold", 24)
        c.drawString(50, 750, "LaundryFlow Invoice")
        
        c.setFont("Helvetica", 12)
        c.drawString(50, 720, f"Invoice #: {order_data.get('invoice_number', 'INV-0000')}")
        c.drawString(50, 705, f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}")
        
        # Customer Info
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, 670, "Bill To:")
        c.setFont("Helvetica", 12)
        c.drawString(50, 650, f"Customer: {order_data.get('customer_name', 'N/A')}")
        c.drawString(50, 635, f"Order ID: {order_data.get('order_number', 'N/A')}")
        
        # Pricing Breakdown
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, 590, "Summary:")
        c.setFont("Helvetica", 12)
        
        y_pos = 560
        c.drawString(50, y_pos, f"Subtotal: ${order_data.get('subtotal', 0.0):.2f}")
        c.drawString(50, y_pos - 20, f"Tax: ${order_data.get('tax', 0.0):.2f}")
        c.drawString(50, y_pos - 40, f"Delivery Fee: ${order_data.get('delivery_fee', 0.0):.2f}")
        c.drawString(50, y_pos - 60, f"Express Fee: ${order_data.get('express_fee', 0.0):.2f}")
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_pos - 100, f"Total: ${order_data.get('total', 0.0):.2f}")
        
        # Footer
        c.setFont("Helvetica-Oblique", 10)
        c.drawString(50, 50, "Thank you for using LaundryFlow!")
        
        c.save()
        buffer.seek(0)
        return buffer.getvalue()
