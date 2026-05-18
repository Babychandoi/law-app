# Google Drive API Setup Guide

Hướng dẫn cấu hình Google Drive API để upload CV ứng viên.

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Ghi nhớ Project ID

## Bước 2: Bật Google Drive API

1. Vào **APIs & Services** > **Library**
2. Tìm kiếm "Google Drive API"
3. Click **Enable**

## Bước 3: Tạo Service Account

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Điền thông tin:
   - Service account name: `law-app-cv-uploader`
   - Service account ID: `law-app-cv-uploader`
   - Description: `Service account for uploading job application CVs`
4. Click **Create and Continue**
5. Grant role: **Editor** (hoặc tối thiểu là **Drive File Creator**)
6. Click **Done**

## Bước 4: Tạo JSON Key

1. Trong danh sách Service Accounts, click vào service account vừa tạo
2. Vào tab **Keys**
3. Click **Add Key** > **Create new key**
4. Chọn **JSON**
5. Click **Create** - file JSON sẽ được tải về

**Chi tiết các bước:**

### Bước 4.1: Vào Service Accounts
- Từ Google Cloud Console
- Menu bên trái: **IAM & Admin** > **Service Accounts**
- Hoặc trực tiếp: https://console.cloud.google.com/iam-admin/serviceaccounts

### Bước 4.2: Chọn Service Account
- Click vào email của service account (dạng `law-app-cv-uploader@project-id.iam.gserviceaccount.com`)

### Bước 4.3: Tạo Key
- Click tab **KEYS** ở phía trên
- Click button **ADD KEY**
- Chọn **Create new key**
- Popup hiện ra:
  - Chọn **JSON** (mặc định)
  - Click **CREATE**
- File JSON sẽ tự động download về máy với tên dạng: `project-id-abc123.json`

**Ví dụ nội dung file JSON:**
```json
{
  "type": "service_account",
  "project_id": "law-app-drive",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "law-app-cv-uploader@law-app-drive.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**LƯU Ý QUAN TRỌNG:**
- File này chứa private key - KHÔNG share cho ai
- KHÔNG commit vào Git
- Lưu file an toàn, nếu mất phải tạo key mới

## Bước 5: Tạo Google Drive Folder (Optional)

1. Truy cập [Google Drive](https://drive.google.com/)
2. Tạo folder mới: `Law App - CVs`
3. Click chuột phải vào folder > **Share**
4. Thêm email của Service Account (có dạng `law-app-cv-uploader@project-id.iam.gserviceaccount.com`)
5. Cấp quyền **Editor**
6. Copy Folder ID từ URL (phần sau `/folders/`)
   - Ví dụ: `https://drive.google.com/drive/folders/1ABC...XYZ`
   - Folder ID là: `1ABC...XYZ`

## Bước 6: Cấu hình Backend

### 6.1. Chuyển đổi JSON key thành single line

Mở file JSON key vừa tải về, copy toàn bộ nội dung và chuyển thành 1 dòng:

```bash
# Linux/Mac
cat service-account-key.json | jq -c . | pbcopy

# Hoặc dùng online tool
# https://www.text-utils.com/json-formatter/
```

### 6.2. Cập nhật backend/.env

```env
# ================= GOOGLE DRIVE API =================
GOOGLE_DRIVE_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
GOOGLE_DRIVE_FOLDER_ID=1ABC...XYZ
```

**Lưu ý:** 
- `GOOGLE_DRIVE_CREDENTIALS_JSON` phải là JSON string trên 1 dòng
- `GOOGLE_DRIVE_FOLDER_ID` là optional, nếu không set thì file sẽ upload vào root của Drive

## Bước 7: Test

1. Restart backend:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

2. Test upload CV từ frontend:
   - Vào trang tuyển dụng
   - Chọn 1 vị trí
   - Điền form và upload CV
   - Kiểm tra Google Drive folder

## Troubleshooting

### Lỗi: "Google Drive credentials not configured"
- Kiểm tra `GOOGLE_DRIVE_CREDENTIALS_JSON` trong `.env`
- Đảm bảo JSON string hợp lệ (không có line break)

### Lỗi: "403 Forbidden"
- Service Account chưa được share quyền vào folder
- Kiểm tra lại email của Service Account
- Cấp quyền Editor cho Service Account

### Lỗi: "File size too large"
- File CV vượt quá 10MB
- Nén lại file hoặc chuyển sang PDF

### Lỗi: "Invalid file type"
- Chỉ chấp nhận: PDF, DOC, DOCX
- Kiểm tra extension của file

## API Endpoints

### Submit Job Application
```
POST /jobs/apply
Content-Type: multipart/form-data

Parameters:
- jobId: string (required)
- jobTitle: string (required)
- candidateName: string (required)
- candidateEmail: string (required)
- candidatePhone: string (optional)
- cvFile: file (required, max 10MB, PDF/DOC/DOCX)

Response:
{
  "code": 200,
  "message": "Application submitted successfully",
  "data": {
    "id": "uuid",
    "jobId": "job-uuid",
    "jobTitle": "Software Engineer",
    "candidateName": "Nguyen Van A",
    "candidateEmail": "email@example.com",
    "candidatePhone": "0123456789",
    "cvFileUrl": "https://drive.google.com/file/d/...",
    "cvFileName": "CV_Nguyen_Van_A_Software_Engineer_1234567890.pdf",
    "status": "PENDING",
    "appliedDate": "2026-02-11T10:30:00Z"
  }
}
```

### Get All Applications (Admin)
```
GET /jobs/applications

Response:
{
  "code": 200,
  "message": "Applications retrieved successfully",
  "data": [...]
}
```

### Get Applications by Job ID
```
GET /jobs/{jobId}/applications

Response:
{
  "code": 200,
  "message": "Applications retrieved successfully",
  "data": [...]
}
```

### Update Application Status (Admin)
```
PUT /jobs/applications/{id}/status?status=REVIEWING&notes=Good candidate

Response:
{
  "code": 200,
  "message": "Application status updated successfully",
  "data": {...}
}
```

## Database Schema

```sql
CREATE TABLE job_application (
    id VARCHAR(255) PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(255),
    cv_file_url VARCHAR(500) NOT NULL,
    cv_file_name VARCHAR(255),
    status VARCHAR(50),
    applied_date TIMESTAMP NOT NULL,
    notes TEXT
);
```

## Status Values

- `PENDING`: Đơn mới nộp, chưa xem
- `REVIEWING`: Đang xem xét
- `ACCEPTED`: Chấp nhận, mời phỏng vấn
- `REJECTED`: Từ chối

## Security Notes

1. **KHÔNG commit** file JSON key vào Git
2. Thêm `service-account-key.json` vào `.gitignore`
3. Sử dụng environment variables cho credentials
4. Rotate service account keys định kỳ (3-6 tháng)
5. Chỉ cấp quyền tối thiểu cần thiết cho Service Account

## Alternative: Sử dụng MinIO thay vì Google Drive

Nếu không muốn dùng Google Drive, có thể sử dụng MinIO (đã có sẵn):

1. Tạo bucket mới: `cvs`
2. Sửa `JobApplicationServiceImpl` để dùng `MinioService` thay vì `GoogleDriveService`
3. File sẽ được lưu tại: `https://minio.luatpoip.com/cvs/CV_...pdf`

Ưu điểm MinIO:
- Không cần setup phức tạp
- Tự host, kiểm soát hoàn toàn
- Không giới hạn storage (tùy server)

Ưu điểm Google Drive:
- Free 15GB
- Dễ quản lý qua UI
- Có version history
- Có thể share link trực tiếp
