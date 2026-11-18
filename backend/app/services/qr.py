import qrcode
import io
import base64

class QRCodeService:
    @staticmethod
    def generate_order_qr(order_number: str, order_id: str) -> str:
        """
        Generates a secure QR code payload containing a reference to the order.
        Returns a base64 encoded PNG string.
        """
        data = f"laundryflow://order/{order_id}?ref={order_number}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        return base64.b64encode(img_byte_arr).decode('utf-8')
