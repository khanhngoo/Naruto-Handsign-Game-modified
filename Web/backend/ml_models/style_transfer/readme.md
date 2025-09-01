# Cấu trúc thư mục
* rl/ckpt/ : chứa checkpoint actor và decoder đã huấn luyện
* input/ : chứa ảnh content (ảnh gốc cần stylize)
* defined_styles/ : chứa ảnh style (ảnh dùng để lấy phong cách)
* output/ : thư mục để lưu ảnh kết quả
* eval.py : file code chính

# Cách chạy
* Lấy ảnh input người dùng và để vô file input. 
* Folder defined_styles là folder các styles để cho người dùng chọn. 
## Chạy với một ảnh
