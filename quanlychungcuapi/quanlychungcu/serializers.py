from rest_framework import serializers

from quanlychungcu.models import PhieuDongTien, NguoiDung, TheGiuXeNguoiThan, ThongTinChuyenTien, ChiTietPhieuDongTien



class ChiTietPhieuDongTienSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChiTietPhieuDongTien
        fields = ['id', 'ten_dich_vu', 'noi_dung', 'phi_dong']

class PhieuDongTienSerializer(serializers.ModelSerializer):
    created_date = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S")
    chitiet_phieudongtiens = ChiTietPhieuDongTienSerializer(many=True)  # Đưa các chi tiết vào
    tong_tien = serializers.SerializerMethodField()  # Thêm trường tong_tien

    class Meta:
        model = PhieuDongTien
        fields = ['id', 'screenshot_xac_nhan', 'status', 'created_date', 'chitiet_phieudongtiens', 'tong_tien']

    def get_tong_tien(self, obj):
        # Tính tổng tiền từ tất cả các ChiTietPhieuDongTien của PhieuDongTien
        return sum([ct.phi_dong for ct in obj.chitiet_phieudongtiens.all()])


class NguoiDungSerializer(serializers.ModelSerializer):

    class Meta:
        model = NguoiDung
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'avatar']
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

