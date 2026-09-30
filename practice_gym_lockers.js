

const readline = require("readline-sync");

// 1. Quản lý trạng thái hệ thống xuyên suốt ca trực
let registeredMembers = []; // Danh sách hội viên đã đăng ký
let totalRevenue = 0;       // Tổng doanh thu ca trực (VNĐ)
let checkInCount = 0;       // Tổng lượt khách check-in

// Biến lưu thông tin hội viên vừa đăng ký gần nhất để tính tiền ở Chức năng 2
let currentMember = null;
let currentMemberFee = 0;

let isRunning = true;

console.log("==================================================");
console.log("   HỆ THỐNG QUẢN LÝ HỘI VIÊN GYM FITNESS (CA TRỰC)  ");
console.log("==================================================");

do {
  console.log("\n---------------- MENU ĐIỀU HÀNH ----------------");
  console.log("1. Đăng ký và chuẩn hóa hồ sơ hội viên mới");
  console.log("2. Tính tiền gói tập và áp dụng chính sách giảm giá");
  console.log("3. Quét mã thẻ check-in tại cửa quay");
  console.log("4. Xuất báo cáo thống kê ca trực và thoát");
  console.log("------------------------------------------------");

  const choice = readline.question("Vui long chon chuc nang (1-4): ").trim();

  switch (choice) {
    case "1": {
      console.log("\n--- [1] ĐĂNG KÝ VÀ CHUẨN HÓA HỒ SƠ HỘI VIÊN MỚI ---");
      let name = "";
      while (!name) {
        name = readline.question("Nhap ho va ten hoi vien: ").trim();
        if (!name) console.log("Họ tên không được để trống!");
      }

      // Chuẩn hóa họ tên: viết hoa chữ cái đầu mỗi từ
      name = name
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      let packageType = "";
      while (packageType !== "STANDARD" && packageType !== "VIP") {
        packageType = readline
          .question("Chon goi tap (STANDARD / VIP): ")
          .trim()
          .toUpperCase();
        if (packageType !== "STANDARD" && packageType !== "VIP") {
          console.log("Gói tập không hợp lệ! Chỉ chọn STANDARD hoặc VIP.");
        }
      }

      let months = 0;
      while (isNaN(months) || months <= 0) {
        months = parseInt(readline.question("Nhap so thang dang ky (>= 1): "), 10);
        if (isNaN(months) || months <= 0) {
          console.log("Số tháng phải là số nguyên dương!");
        }
      }

      let ptSessions = -1;
      while (isNaN(ptSessions) || ptSessions < 0) {
        ptSessions = parseInt(readline.question("Nhap so buoi thue PT kem rieng (>= 0): "), 10);
        if (isNaN(ptSessions) || ptSessions < 0) {
          console.log("Số buổi PT phải là số không âm!");
        }
      }

      // Sinh mã thẻ chuẩn quy tắc: GYM-{PACKAGE}-{YEAR}
      const currentYear = new Date().getFullYear();
      const memberCode = `GYM-${packageType}-${currentYear}`;

      currentMember = {
        name,
        packageType,
        months,
        ptSessions,
        memberCode,
        isBilled: false,
      };

      console.log("\n Đăng ký hồ sơ thành công!");
      console.log(`- Hội viên: ${currentMember.name}`);
      console.log(`- Mã thẻ tạm cấp: ${currentMember.memberCode}`);
      console.log(`- Gói tập: ${currentMember.packageType} | Thời hạn: ${currentMember.months} tháng | PT: ${currentMember.ptSessions} buổi`);
      console.log(">> Vui lòng chọn chức năng 2 để tính tiền và kích hoạt thẻ.");
      break;
    }

    case "2": {
      console.log("\n--- [2] TÍNH TIỀN GÓI TẬP & CHIẾT KHẤU ---");

      // Chặn nếu chưa đăng ký ở chức năng 1 hoặc đã thanh toán xong
      if (!currentMember) {
        console.log(" Cảnh báo: Chưa có hồ sơ hội viên mới nào được tạo! Vui lòng chọn 1 để đăng ký trước.");
        break;
      }

      if (currentMember.isBilled) {
        console.log(` Hồ sơ của hội viên "${currentMember.name}" đã được tính tiền và thanh toán trước đó.`);
        console.log("Vui lòng thực hiện chức năng 1 nếu có hội viên mới tiếp theo.");
        break;
      }

      // Đơn giá quy định
      const BASE_STANDARD = 500000;
      const BASE_VIP = 800000;
      const PT_FEE = 300000;

      const monthlyRate = currentMember.packageType === "VIP" ? BASE_VIP : BASE_STANDARD;
      const baseGymFee = monthlyRate * currentMember.months;
      const basePtFee = currentMember.ptSessions * PT_FEE;
      const subTotal = baseGymFee + basePtFee;

      // Tính chiết khấu dựa trên số tháng
      let discountRate = 0;
      if (currentMember.months >= 12) {
        discountRate = 0.25;
      } else if (currentMember.months >= 6) {
        discountRate = 0.15;
      }

      const discountAmount = subTotal * discountRate;
      currentMemberFee = subTotal - discountAmount;

      // Cộng dồn vào doanh thu ca trực và lưu vào danh sách
      totalRevenue += currentMemberFee;
      currentMember.isBilled = true;
      currentMember.finalFee = currentMemberFee;
      registeredMembers.push({ ...currentMember });

      // In hóa đơn chi tiết
      console.log("=== BIÊN LAI HỌC PHÍ ===");
      console.log(`Hội viên: ${currentMember.name} | Mã thẻ: ${currentMember.memberCode}`);
      console.log(`- Phí gói tập (${currentMember.packageType} x ${currentMember.months} tháng): ${baseGymFee.toLocaleString("vi-VN")} VNĐ`);
      console.log(`- Phí PT kèm riêng (${currentMember.ptSessions} buổi): ${basePtFee.toLocaleString("vi-VN")} VNĐ`);
      console.log(`- Tổng tiền gốc: ${subTotal.toLocaleString("vi-VN")} VNĐ`);
      console.log(`- Chiết khấu (${discountRate * 100}%): -${discountAmount.toLocaleString("vi-VN")} VNĐ`);
      console.log(`- TỔNG THANH TOÁN: ${currentMemberFee.toLocaleString("vi-VN")} VNĐ`);
      console.log("------------------------");
      console.log(" Thanh toán hoàn tất! Hội viên đã được kích hoạt thẻ vào hệ thống.");
      break;
    }

    case "3": {
      console.log("\n--- [3] QUÉT MÃ THẺ CHECK-IN TẠI CỬA QUAY ---");
      const scanCode = readline.question("Quet/Nhap ma the can check-in: ").trim();
      const currentYearStr = new Date().getFullYear().toString();

      // Kiểm tra định dạng: Bắt đầu bằng "GYM-", kết thúc bằng năm hiện tại
      const isValidFormat = scanCode.startsWith("GYM-") && scanCode.endsWith(currentYearStr);

      if (!isValidFormat) {
        console.log(` Từ chối vào cửa: Mã thẻ không đúng định dạng (Phải bắt đầu bằng 'GYM-' và kết thúc bằng '${currentYearStr}').`);
        break;
      }

      // Xác minh mã thẻ có thuộc danh sách hội viên hợp lệ đã thanh toán không
      const memberFound = registeredMembers.find((m) => m.memberCode === scanCode);

      if (memberFound) {
        checkInCount++;
        console.log(` Cửa mở! Check-in thành công.`);
        console.log(`Xin chào hội viên: ${memberFound.name} (${memberFound.packageType})`);
      } else {
        // Hỗ trợ trường hợp khách dùng thẻ phát hành trước ca làm việc nhưng hợp lệ cấu trúc
        checkInCount++;
        console.log(" Cửa mở! Thẻ hợp lệ (Lưu lượng ca tăng +1).");
      }

      console.log(`[Lưu lượng ca trực hiện tại: ${checkInCount} lượt check-in]`);
      break;
    }

    case "4": {
      console.log("\n==================================================");
      console.log("          BÁO CÁO TỔNG KẾT CA TRỰC PHÒNG GYM       ");
      console.log("==================================================");
      console.log(`- Tổng số hội viên đăng ký mới: ${registeredMembers.length} người`);
      console.log(`- Tổng lượt quét thẻ check-in : ${checkInCount} lượt`);
      console.log(`- Tổng doanh thu thu về trong ca: ${totalRevenue.toLocaleString("vi-VN")} VNĐ`);
      console.log("--------------------------------------------------");

      if (registeredMembers.length > 0) {
        console.log("Danh sách chi tiết hội viên mới:");
        registeredMembers.forEach((m, idx) => {
          console.log(`  ${idx + 1}. ${m.name} | Gói: ${m.packageType} (${m.months}T) | Phí: ${m.finalFee.toLocaleString("vi-VN")} VNĐ | Mã: ${m.memberCode}`);
        });
      }

      console.log("==================================================");
      console.log("Đã kết thúc ca trực. Hẹn gặp lại!");
      isRunning = false;
      break;
    }

    default:
      console.log(" Lựa chọn không hợp lệ! Vui lòng chỉ chọn từ 1 đến 4.");
      break;
  }
} while (isRunning);