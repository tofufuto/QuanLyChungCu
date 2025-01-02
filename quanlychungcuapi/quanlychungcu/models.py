from tkinter.constants import CASCADE

from cloudinary import CloudinaryImage
from cloudinary.models import CloudinaryField
from django.db import models
from django.contrib.auth.models import AbstractUser
from quanlychungcu import PhieuStatus, PhanAnhStatus


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Phong(BaseModel):
    so_phong = models.CharField(max_length=255,unique=True)

    def __str__(self):
        return self.so_phong

class NguoiDung(AbstractUser):
     avatar = CloudinaryField()
     sdt = models.CharField(max_length=10)
     phong = models.ForeignKey(Phong,null=True,on_delete=models.PROTECT)

class PhieuDongTien(BaseModel):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, null=False)
    status = models.CharField(max_length=255,null=False,default=PhieuStatus.WAITING.value)

class ChiTietPhieuDongTien(BaseModel):
    phieu = models.ForeignKey(PhieuDongTien,on_delete=models.CASCADE,null=False)
    noi_dung = models.TextField(null=False)
    phi_dong = models.DecimalField(max_digits=12, decimal_places=2,null=False)

class TheGiuXeNguoiThan(BaseModel):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, null=False)
    so_xe = models.CharField(max_length=255,null=False)
    ten_nguoi_than = models.CharField(max_length=255,null=False)

class PhanAnh(BaseModel):
    noi_dung = models.TextField(null=False)
    tieu_de = models.TextField(null=False)
    status = models.CharField(max_length=255,null=False,default=PhanAnhStatus.WAITING.value)

class HinhAnhPhanAnh (BaseModel):
    image = models.ImageField(upload_to='hinh_anh_phan_anh/%Y/%m/')

class TuDoDienTu(BaseModel):
    ten_do = models.CharField(max_length=255)
    mo_ta = models.CharField(max_length=255)
    nguoi_dung = models.ForeignKey(NguoiDung,on_delete=models.PROTECT,null=False)

class LuaChon(BaseModel):
    ten_lua_chon = models.CharField(max_length=255)

    def __str__(self):
        return self.ten_lua_chon

class KhaoSat(BaseModel):
    ngay_han = models.DateTimeField(null=True)

class ChiTietKhaoSat(BaseModel):
    noi_dung = models.TextField(null=False)
    khao_sat = models.ForeignKey(KhaoSat,on_delete=models.CASCADE,null=False)

class TraLoi(BaseModel):
    nguoi_dung = models.ForeignKey(NguoiDung,on_delete=models.CASCADE,null=False)
    lua_chon = models.ForeignKey(LuaChon,on_delete=models.PROTECT,null=False)
    chi_tiet_khao_sat = models.ForeignKey(ChiTietKhaoSat,on_delete=models.CASCADE,null=False)


