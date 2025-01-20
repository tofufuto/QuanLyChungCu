from PIL.ImageChops import screen
from django import forms
from django.contrib import admin
from django.urls import path
from django.utils.html import format_html
from django.utils import timezone


from quanlychungcu.models import Phong, NguoiDung, PhieuDongTien, ChiTietPhieuDongTien, KhaoSat, ChiTietKhaoSat, \
    LuaChon, TuDoDienTu, PhanAnh, TheGiuXeNguoiThan, BaseModel, PhiCacDichVu, ThongTinChuyenTien


class MyAdminSite(admin.AdminSite):
    site_header = "Quản Lý Chung Cư"
    site_title = "Hệ Thống Quản Lý"
    index_title = "Trang quản trị hệ thống"


class AdminPhong(admin.ModelAdmin):
    list_display = ['id','so_phong','created_date']
    search_fields = ['so_phong']
    list_filter = ['created_date']
    readonly_fields = ['created_date','update_date']

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['so_phong','created_date','update_date']
        return ['created_date','update_date']

class NguoiDungForm(forms.ModelForm):
    class Meta:
        model = NguoiDung
        fields = '__all__'
        widgets = {
            'password': forms.PasswordInput(render_value=True),  # Dùng PasswordInput
        }

def tao_phieu_dong_tien(modeladmin, request, queryset):
    cac_dich_vu = PhiCacDichVu.objects.all()
    for user in queryset:
        if user.is_staff or user.is_superuser:
            continue
        phieu_dong_tien = PhieuDongTien.objects.create(nguoi_dung=user,screenshot_xac_nhan = None)
        for dv in cac_dich_vu:
            chi_tiet_phieu = ChiTietPhieuDongTien.objects.create(phieu=phieu_dong_tien,ten_dich_vu=dv.ten_dich_vu,noi_dung=dv.noi_dung,phi_dong=dv.phi_dong)

    modeladmin.message_user(request, "Đã tạo phiếu")
    tao_phieu_dong_tien.short_description = "Tạo các phiếu đóng tiền cho người dùng được chọn(trừ admin)"

class AdminNguoiDung(admin.ModelAdmin):
    form = NguoiDungForm

    list_display = ['id','first_name','last_name','username','birthdate','date_joined','phong']
    search_fields = ['id','first_name','last_name','username']
    list_filter = ['birthdate','date_joined','is_superuser','is_staff','is_active']

    actions = [tao_phieu_dong_tien]

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['id','first_name','last_name','username','birthdate','date_joined','sdt','email','last_login','is_staff','is_superuser','avatar_display','cccd']
        return []

    def get_exclude(self, request, obj=None):
        if obj:
            return ['password','avatar']
        return ['last_login','date_joined']

    def avatar_display(self, obj):
        if obj.avatar:  # Kiểm tra nếu trường avatar có dữ liệu
            return format_html('<img src="{}" style="height: 100px; width: auto;" />', obj.avatar.url)
        return "No Image"

    avatar_display.short_description = "Avatar"

    def save_model(self, request, obj, form, change):

        if obj.password and not change:
            obj.set_password(obj.password)
        super().save_model(request, obj, form, change)


    
class AdminPhiCacDichVu(admin.ModelAdmin):
    search_fields = ['ten_dich_vu']
    list_filter = ['created_date']
    readonly_fields = ['created_date','update_date']
    list_display = ['ten_dich_vu']

class AdminThongTinChuyenTien(admin.ModelAdmin):
    list_display = ['ten','so_tai_khoang','ngan_hang']
    readonly_fields = ['created_date','update_date']


class ChiTietPhieuDongTienInline(admin.TabularInline):  # Dùng TabularInline hoặc StackedInline
    model = ChiTietPhieuDongTien
    fields = ['ten_dich_vu', 'noi_dung', 'phi_dong']  # Các trường hiển thị trong form admin
    readonly_fields = ['ten_dich_vu', 'noi_dung', 'phi_dong']  # Các trường chỉ đọc
    extra = 0  # Không hiển thị form thêm mới
    max_num = 0
    can_delete = False  # Tắt khả năng xóa

class MonthYearFilter(admin.SimpleListFilter):
    title = 'Tháng và Năm'  # Tiêu đề của bộ lọc
    parameter_name = 'month_year'  # Tên tham số URL

    def lookups(self, request, model_admin):
        # Trả về danh sách các lựa chọn tháng và năm
        current_year = timezone.now().year
        lookups = []
        for i in range(1, 13):  # 12 tháng
            month_name = timezone.datetime(current_year, i, 1).strftime('%B')  # Tên tháng
            lookups.append((f'{current_year}-{i:02d}', f'{month_name} {current_year}'))
        return lookups

    def queryset(self, request, queryset):
        # Xử lý dữ liệu khi người dùng chọn tháng và năm từ bộ lọc
        if self.value():
            year_month = self.value().split('-')
            year = int(year_month[0])
            month = int(year_month[1])
            return queryset.filter(created_date__year=year, created_date__month=month)
        return queryset


class PhieuDongTienAdmin(admin.ModelAdmin):
    list_display = ['id','nguoi_dung', 'status','created_date']
    inlines = [ChiTietPhieuDongTienInline]  # Thêm Inline vào trang admin của PhieuDongTien
    readonly_fields = ['id','nguoi_dung', 'screenshot_xac_nhan_display','created_date','update_date']
    list_filter = ['status',MonthYearFilter]
    search_fields = ['nguoi_dung__username']
    exclude = ['screenshot_xac_nhan']

    # Ghi đè get_model_perms để tắt quyền 'add' và 'delete' cho model chính
    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms['add'] = False  # Tắt quyền tạo mới
        perms['delete'] = False  # Tắt quyền xóa
        return perms

    # Ghi đè has_add_permission để tắt quyền thêm mới
    def has_add_permission(self, request):
        return False  # Trả về False để tắt nút "Add"

    # Ghi đè has_delete_permission để tắt quyền xóa
    def has_delete_permission(self, request, obj=None):
        return False  # Trả về False để tắt quyền xóa

    def screenshot_xac_nhan_display(self, obj):
        if obj.screenshot_xac_nhan:  # Kiểm tra nếu trường avatar có dữ liệu
            return format_html('<img src="{}" style="height: 800px; width: 450px;" />', obj.screenshot_xac_nhan.url)
        return "No Image"

class TheGiuXeAdmin(admin.ModelAdmin):
    list_display = ['so_xe','nguoi_dung','ten_nguoi_than']
    readonly_fields = ['so_xe','nguoi_dung','ten_nguoi_than','created_date','update_date']

admin_site = MyAdminSite(name='Quản Lý Chung Cư')

admin_site.register(Phong,AdminPhong)
admin_site.register(PhieuDongTien, PhieuDongTienAdmin)
admin_site.register(NguoiDung,AdminNguoiDung)
admin_site.register(PhiCacDichVu,AdminPhiCacDichVu)
admin_site.register(ThongTinChuyenTien,AdminThongTinChuyenTien)
admin_site.register(TheGiuXeNguoiThan,TheGiuXeAdmin)


