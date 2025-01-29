from datetime import datetime

import random
from symtable import Class

from rest_framework import serializers

from quanlychungcu import VNP_RETURN_URL, VNP_TMNCODE, VNP_URL, VNP_HASHSECRET
from quanlychungcu.models import PhieuDongTien, NguoiDung, TheGiuXeNguoiThan, ThongTinChuyenTien, ChiTietPhieuDongTien, \
    Phong, ChiTietKhaoSat, KhaoSat, TraLoi, TuDoDienTu, PhanAnh, HinhAnhPhanAnh


class ChiTietPhieuDongTienSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChiTietPhieuDongTien
        fields = ['id', 'ten_dich_vu', 'noi_dung', 'phi_dong']

class PhieuDongTienSerializer(serializers.ModelSerializer):
    created_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S")
    tong_tien = serializers.SerializerMethodField()  # Thêm trường tong_tien

    class Meta:
        model = PhieuDongTien
        fields = ['id', 'screenshot_xac_nhan', 'status', 'created_date', 'tong_tien']

    def get_tong_tien(self, obj):
        # Tính tổng tiền từ tất cả các ChiTietPhieuDongTien của PhieuDongTien
        return int(sum([ct.phi_dong for ct in obj.chitiet_phieudongtiens.all()]))

class PhieuDongTienChiTietSerializer(PhieuDongTienSerializer):
    chitiet_phieudongtiens = ChiTietPhieuDongTienSerializer(many=True, read_only=True)  # Chỉ thêm trong chi tiết
    vnpay_url = serializers.SerializerMethodField()

    class Meta(PhieuDongTienSerializer.Meta):
        fields = PhieuDongTienSerializer.Meta.fields + ['chitiet_phieudongtiens','vnpay_url']

    def get_vnpay_url(self, obj):
        from quanlychungcu.vnpay import vnpay  # Import class VNPay đã cấu hình
        vnPay = vnpay()

        order_type = 'other'
        order_id = str(obj.id)
        amount = sum([ct.phi_dong for ct in obj.chitiet_phieudongtiens.all()])
        order_desc = f"Thanh toán phiếu đóng tiền {order_id}"
        ipaddr = self.context.get('request').META.get('REMOTE_ADDR')
        if not ipaddr:
            ipaddr = self.context.get('request').META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0]
        # Build URL Payment
        vnp = vnpay()
        vnp.requestData['vnp_Version'] = '2.1.0'
        vnp.requestData['vnp_Command'] = 'pay'
        vnp.requestData['vnp_TmnCode'] = VNP_TMNCODE
        vnp.requestData['vnp_Amount'] = int(amount * 100)
        vnp.requestData['vnp_CurrCode'] = 'VND'
        vnp.requestData['vnp_TxnRef'] = order_id
        vnp.requestData['vnp_OrderInfo'] = order_desc
        vnp.requestData['vnp_OrderType'] = order_type
        vnp.requestData['vnp_Locale'] = 'vn'
        vnp.requestData['vnp_CreateDate'] = datetime.now().strftime('%Y%m%d%H%M%S')  # 20150410063022
        vnp.requestData['vnp_IpAddr'] = ipaddr
        vnp.requestData['vnp_ReturnUrl'] = VNP_RETURN_URL
        vnpay_payment_url = vnp.get_payment_url(VNP_URL, VNP_HASHSECRET)

        return vnpay_payment_url


class PhongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phong
        fields = ['id', 'so_phong']

class NguoiDungSerializer(serializers.ModelSerializer):
    phong = PhongSerializer(read_only=True)
    class Meta:
        model = NguoiDung
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'avatar','sdt','cccd','birthdate','phong']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

class TheGiuXeSerializer(serializers.ModelSerializer):
    created_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S")

    class Meta:
        model = TheGiuXeNguoiThan
        fields = ['id', 'so_xe','ten_nguoi_than','nguoi_dung','created_date']
        # read_only_fields = ['nguoi_dung','created_date']

class ThongTinCHuyenTienSerializer(serializers.ModelSerializer):
    created_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S")

    class Meta:
        model = ThongTinChuyenTien
        fields = ['id','ten','ngan_hang','so_tai_khoang' , 'created_date']

class ChiTietKhaoSatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChiTietKhaoSat
        fields = ['id', 'noi_dung']

class KhaoSatSerializer(serializers.ModelSerializer):
    chi_tiet_khao_sat = serializers.SerializerMethodField()
    da_tra_loi = serializers.SerializerMethodField()  # Kiểm tra xem khảo sát đã có câu trả lời chưa

    class Meta:
        model = KhaoSat
        fields = ['id', 'ten_khao_sat', 'ngay_han', 'chi_tiet_khao_sat', 'da_tra_loi']

    def get_chi_tiet_khao_sat(self, obj):
        request = self.context.get('request', None)
        if request and request.parser_context['view'].action == 'retrieve':
            return ChiTietKhaoSatSerializer(obj.chi_tiet_khao_sat.all(), many=True).data
        return None  # Không trả về chi tiết khi gọi danh sách

    def get_da_tra_loi(self, obj):
        """
        Kiểm tra xem có câu trả lời nào thuộc khảo sát này không
        """
        return TraLoi.objects.filter(chi_tiet_khao_sat__khao_sat=obj).exists()

class TraLoiSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraLoi
        fields = ['id', 'chi_tiet_khao_sat', 'tra_loi']

    def create(self, validated_data):
        # Lấy thông tin người dùng từ request
        user = self.context['request'].user
        validated_data['nguoi_dung'] = user
        return super().create(validated_data)

class TuDoDienTuSerializer(serializers.ModelSerializer):
    created_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S")
    class Meta:
        model = TuDoDienTu
        fields = '__all__'

class HinhAnhPhanAnhSerializer(serializers.ModelSerializer):
    class Meta:
        model = HinhAnhPhanAnh
        fields = ["id", "image"]

class PhanAnhSerializer(serializers.ModelSerializer):
    hinh_anh_phan_anhs = HinhAnhPhanAnhSerializer(many=True, read_only=True)

    class Meta:
        model = PhanAnh
        fields = ["id", "nguoi_dung", "tieu_de", "noi_dung", "status", "created_at", "hinh_anh_phan_anhs"]





