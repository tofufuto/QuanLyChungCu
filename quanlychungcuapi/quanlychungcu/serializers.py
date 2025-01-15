from rest_framework import serializers

from quanlychungcu.models import PhieuDongTien, NguoiDung


class PhieuDOngTienSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhieuDongTien
        fields =['id','screenshot_xac_nhan','status']

class NguoiDungSerializer(serializers.ModelSerializer):

    class Meta:
        model = NguoiDung
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

