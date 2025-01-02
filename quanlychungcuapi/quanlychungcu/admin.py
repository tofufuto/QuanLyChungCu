from django.contrib import admin
from quanlychungcu.models import Phong, NguoiDung, PhieuDongTien, ChiTietPhieuDongTien, KhaoSat, ChiTietKhaoSat, \
    LuaChon, TuDoDienTu, PhanAnh, TheGiuXeNguoiThan

admin.site.register(Phong)
admin.site.register(NguoiDung)
admin.site.register(PhieuDongTien)
admin.site.register(ChiTietPhieuDongTien)
admin.site.register(KhaoSat)
admin.site.register(ChiTietKhaoSat)
admin.site.register(LuaChon)
admin.site.register(TuDoDienTu)
admin.site.register(PhanAnh)
admin.site.register(TheGiuXeNguoiThan)
