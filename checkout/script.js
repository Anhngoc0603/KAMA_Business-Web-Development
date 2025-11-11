document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Checkout page is starting up...');

  // Đồng bộ với Cart
  const FREE_SHIPPING_THRESHOLD_USD = 50; // giống Cart
  const SHIPPING_FEE_USD = 3; // giống Cart
  const ENGRAVING_FEE_USD = 5; // giống Cart
  // Discount configuration flags (match Cart)
  const APPLY_PERCENT_FIRST = true;
  const ALLOW_FIXED_OVER_PERCENT = false;
  const SHOW_SAVEUP_NEGATIVE = true;

  // ✅ THÊM DATA ĐỊA CHỈ ĐẦY ĐỦ
  const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
    "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    "District of Columbia"
  ];

  const VN_PROVINCES = [
    "Hà Nội", "TP. Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ",
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre",
    "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk",
    "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh",
    "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum",
    "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình",
    "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh",
    "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
    "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];

  const VN_DISTRICTS = {
    "Hà Nội": [
      "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng",
      "Hoàng Mai", "Thanh Xuân", "Sóc Sơn", "Đông Anh", "Gia Lâm", "Nam Từ Liêm", "Thanh Trì",
      "Bắc Từ Liêm", "Mê Linh", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ", "Thạch Thất",
      "Quốc Oai", "Chương Mỹ", "Đan Phượng", "Hoài Đức", "Thanh Oai", "Mỹ Đức", "Ứng Hòa",
      "Thường Tín", "Phú Xuyên", "Mỹ Đức", "Ứng Hòa"
    ],
    
    "TP. Hồ Chí Minh": [
      "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10",
      "Quận 11", "Quận 12", "Gò Vấp", "Tân Bình", "Tân Phú", "Bình Thạnh", "Phú Nhuận",
      "Thủ Đức", "Bình Tân", "Củ Chi", "Hóc Môn", "Bình Chánh", "Nhà Bè", "Cần Giờ"
    ],
    
    "Hải Phòng": [
      "Hồng Bàng", "Ngô Quyền", "Lê Chân", "Hải An", "Kiến An", "Đồ Sơn", "Dương Kinh",
      "Thuỷ Nguyên", "An Dương", "An Lão", "Kiến Thuỵ", "Tiên Lãng", "Vĩnh Bảo", "Cát Hải",
      "Bạch Long Vĩ"
    ],
    
    "Đà Nẵng": [
      "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang",
      "Hoàng Sa"
    ],
    
    "Cần Thơ": [
      "Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", "Vĩnh Thạnh", "Cờ Đỏ",
      "Phong Điền", "Thới Lai"
    ],
    
    "An Giang": [
      "Long Xuyên", "Châu Đốc", "An Phú", "Tân Châu", "Phú Tân", "Châu Phú", "Tịnh Biên",
      "Tri Tôn", "Châu Thành", "Chợ Mới", "Thoại Sơn"
    ],
    
    "Bà Rịa - Vũng Tàu": [
      "Bà Rịa", "Vũng Tàu", "Châu Đức", "Xuyên Mộc", "Long Điền", "Đất Đỏ", "Tân Thành",
      "Côn Đảo"
    ],
    
    "Bắc Giang": [
      "Bắc Giang", "Yên Thế", "Lục Ngạn", "Sơn Động", "Lục Nam", "Tân Yên", "Hiệp Hòa",
      "Lạng Giang", "Việt Yên", "Yên Dũng"
    ],
    
    "Bắc Kạn": [
      "Bắc Kạn", "Ba Bể", "Bạch Thông", "Chợ Đồn", "Chợ Mới", "Na Rì", "Ngân Sơn", "Pác Nặm"
    ],
    
    "Bạc Liêu": [
      "Bạc Liêu", "Vĩnh Lợi", "Hồng Dân", "Phước Long", "Giá Rai", "Đông Hải", "Hòa Bình"
    ],
    
    "Bắc Ninh": [
      "Bắc Ninh", "Từ Sơn", "Yên Phong", "Quế Võ", "Tiên Du", "Thuận Thành", "Gia Bình", "Lương Tài"
    ],
    
    "Bến Tre": [
      "Bến Tre", "Châu Thành", "Chợ Lách", "Mỏ Cày Bắc", "Mỏ Cày Nam", "Giồng Trôm",
      "Bình Đại", "Ba Tri", "Thạnh Phú"
    ],
    
    "Bình Định": [
      "Quy Nhơn", "An Lão", "Hoài Ân", "Hoài Nhơn", "Phù Mỹ", "Vĩnh Thạnh", "Tây Sơn",
      "Phù Cát", "An Nhơn", "Tuy Phước", "Vân Canh"
    ],
    
    "Bình Dương": [
      "Thủ Dầu Một", "Bàu Bàng", "Dầu Tiếng", "Bến Cát", "Phú Giáo", "Tân Uyên", "Dĩ An",
      "Thuận An", "Bắc Tân Uyên"
    ],
    
    "Bình Phước": [
      "Đồng Xoài", "Phước Long", "Bình Long", "Chơn Thành", "Bù Đăng", "Bù Đốp", "Bù Gia Mập",
      "Đồng Phú", "Hớn Quản", "Lộc Ninh"
    ],
    
    "Bình Thuận": [
      "Phan Thiết", "La Gi", "Tuy Phong", "Bắc Bình", "Hàm Thuận Bắc", "Hàm Thuận Nam",
      "Hàm Tân", "Đức Linh", "Tánh Linh", "Phú Quý"
    ],
    
    "Cà Mau": [
      "Cà Mau", "U Minh", "Thới Bình", "Trần Văn Thời", "Cái Nước", "Đầm Dơi", "Năm Căn",
      "Phú Tân", "Ngọc Hiển"
    ],
    
    "Cao Bằng": [
      "Cao Bằng", "Bảo Lâm", "Bảo Lạc", "Hà Quảng", "Trùng Khánh", "Hạ Lang", "Quảng Hòa",
      "Hoà An", "Nguyên Bình", "Thạch An", "Trà Lĩnh"
    ],
    
    "Đắk Lắk": [
      "Buôn Ma Thuột", "Buôn Hồ", "Ea H'leo", "Ea Súp", "Buôn Đôn", "Cư M'gar", "Krông Búk",
      "Krông Năng", "Ea Kar", "M'Đrắk", "Krông Bông", "Krông Pắc", "Krông A Na", "Lắk", "Cư Kuin"
    ],
    
    "Đắk Nông": [
      "Gia Nghĩa", "Đắk Glong", "Cư Jút", "Đắk Mil", "Krông Nô", "Đắk Song", "Đắk R'Lấp", "Tuy Đức"
    ],
    
    "Điện Biên": [
      "Điện Biên Phủ", "Mường Lay", "Mường Nhé", "Mường Chà", "Tủa Chùa", "Tuần Giáo",
      "Điện Biên", "Điện Biên Đông", "Mường Ảng", "Nậm Pồ"
    ],
    
    "Đồng Nai": [
      "Biên Hòa", "Long Khánh", "Tân Phú", "Vĩnh Cửu", "Định Quán", "Trảng Bom", "Thống Nhất",
      "Cẩm Mỹ", "Long Thành", "Xuân Lộc", "Nhơn Trạch"
    ],
    
    "Đồng Tháp": [
      "Cao Lãnh", "Sa Đéc", "Hồng Ngự", "Tân Hồng", "Hồng Ngự", "Tam Nông", "Tháp Mười",
      "Cao Lãnh", "Lấp Vò", "Lai Vung", "Châu Thành"
    ],
    
    "Gia Lai": [
      "Pleiku", "An Khê", "Ayun Pa", "KBang", "Đăk Đoa", "Chư Păh", "Ia Grai", "Mang Yang",
      "Kông Chro", "Đức Cơ", "Chư Prông", "Chư Sê", "Đăk Pơ", "Ia Pa", "Krông Pa", "Phú Thiện"
    ],
    
    "Hà Giang": [
      "Hà Giang", "Đồng Văn", "Mèo Vạc", "Yên Minh", "Quản Bạ", "Vị Xuyên", "Bắc Mê",
      "Hoàng Su Phì", "Xín Mần", "Bắc Quang", "Quang Bình"
    ],
    
    "Hà Nam": [
      "Phủ Lý", "Duy Tiên", "Kim Bảng", "Thanh Liêm", "Bình Lục", "Lý Nhân"
    ],
    
    "Hà Tĩnh": [
      "Hà Tĩnh", "Hồng Lĩnh", "Hương Sơn", "Đức Thọ", "Nghi Xuân", "Can Lộc", "Hương Khê",
      "Thạch Hà", "Cẩm Xuyên", "Kỳ Anh", "Lộc Hà", "Vũ Quang"
    ],
    
    "Hải Dương": [
      "Hải Dương", "Chí Linh", "Nam Sách", "Kinh Môn", "Kim Thành", "Thanh Hà", "Cẩm Giàng",
      "Bình Giang", "Gia Lộc", "Tứ Kỳ", "Ninh Giang", "Thanh Miện"
    ],
    
    "Hậu Giang": [
      "Vị Thanh", "Ngã Bảy", "Châu Thành", "Châu Thành A", "Phụng Hiệp", "Vị Thủy", "Long Mỹ"
    ],
    
    "Hòa Bình": [
      "Hòa Bình", "Đà Bắc", "Lương Sơn", "Kim Bôi", "Cao Phong", "Tân Lạc", "Mai Châu",
      "Lạc Sơn", "Yên Thủy", "Lạc Thủy"
    ],
    
    "Hưng Yên": [
      "Hưng Yên", "Văn Lâm", "Văn Giang", "Yên Mỹ", "Mỹ Hào", "Ân Thi", "Khoái Châu",
      "Kim Động", "Tiên Lữ", "Phù Cừ"
    ],
    
    "Khánh Hòa": [
      "Nha Trang", "Cam Ranh", "Cam Lâm", "Vạn Ninh", "Ninh Hòa", "Khánh Vĩnh", "Diên Khánh",
      "Khánh Sơn", "Trường Sa"
    ],
    
    "Kiên Giang": [
      "Rạch Giá", "Hà Tiên", "Kiên Lương", "Hòn Đất", "Tân Hiệp", "Châu Thành", "Giồng Riềng",
      "Gò Quao", "An Biên", "An Minh", "Vĩnh Thuận", "Phú Quốc", "Kiên Hải", "U Minh Thượng"
    ],
    
    "Kon Tum": [
      "Kon Tum", "Đắk Glei", "Ngọc Hồi", "Đắk Tô", "Kon Plông", "Kon Rẫy", "Đắk Hà", "Sa Thầy",
      "Tu Mơ Rông", "Ia H' Drai"
    ],
    
    "Lai Châu": [
      "Lai Châu", "Tam Đường", "Mường Tè", "Sìn Hồ", "Phong Thổ", "Than Uyên", "Tân Uyên", "Nậm Nhùn"
    ],
    
    "Lâm Đồng": [
      "Đà Lạt", "Bảo Lộc", "Đam Rông", "Lạc Dương", "Lâm Hà", "Đơn Dương", "Đức Trọng",
      "Di Linh", "Bảo Lâm", "Cát Tiên"
    ],
    
    "Lạng Sơn": [
      "Lạng Sơn", "Tràng Định", "Bình Gia", "Văn Lãng", "Cao Lộc", "Văn Quan", "Bắc Sơn",
      "Hữu Lũng", "Chi Lăng", "Lộc Bình", "Đình Lập"
    ],
    
    "Lào Cai": [
      "Lào Cai", "Bát Xát", "Mường Khương", "Si Ma Cai", "Bắc Hà", "Bảo Thắng", "Bảo Yên",
      "Sa Pa", "Văn Bàn"
    ],
    
    "Long An": [
      "Tân An", "Kiến Tường", "Vĩnh Hưng", "Mộc Hóa", "Tân Thạnh", "Thạnh Hóa", "Đức Huệ",
      "Đức Hòa", "Bến Lức", "Thủ Thừa", "Tân Trụ", "Cần Đước", "Cần Giuộc", "Châu Thành", "Tân Hưng"
    ],
    
    "Nam Định": [
      "Nam Định", "Mỹ Lộc", "Vụ Bản", "Ý Yên", "Nghĩa Hưng", "Nam Trực", "Trực Ninh",
      "Xuân Trường", "Giao Thủy", "Hải Hậu"
    ],
    
    "Nghệ An": [
      "Vinh", "Cửa Lò", "Thái Hoà", "Quế Phong", "Quỳ Châu", "Kỳ Sơn", "Tương Dương",
      "Nghĩa Đàn", "Quỳ Hợp", "Quỳnh Lưu", "Con Cuông", "Tân Kỳ", "Anh Sơn", "Diễn Châu",
      "Yên Thành", "Đô Lương", "Thanh Chương", "Nghi Lộc", "Nam Đàn", "Hưng Nguyên"
    ],
    
    "Ninh Bình": [
      "Ninh Bình", "Tam Điệp", "Nho Quan", "Gia Viễn", "Hoa Lư", "Yên Khánh", "Kim Sơn", "Yên Mô"
    ],
    
    "Ninh Thuận": [
      "Phan Rang-Tháp Chàm", "Bác Ái", "Ninh Sơn", "Ninh Hải", "Ninh Phước", "Thuận Bắc", "Thuận Nam"
    ],
    
    "Phú Thọ": [
      "Việt Trì", "Phú Thọ", "Đoan Hùng", "Hạ Hoà", "Thanh Ba", "Phù Ninh", "Yên Lập",
      "Cẩm Khê", "Tam Nông", "Lâm Thao", "Thanh Sơn", "Thanh Thuỷ"
    ],
    
    "Phú Yên": [
      "Tuy Hoà", "Sông Cầu", "Đồng Xuân", "Tuy An", "Sơn Hòa", "Sông Hinh", "Tây Hoà", "Phú Hoà"
    ],
    
    "Quảng Bình": [
      "Đồng Hới", "Minh Hóa", "Tuyên Hóa", "Quảng Trạch", "Bố Trạch", "Quảng Ninh", "Lệ Thủy"
    ],
    
    "Quảng Nam": [
      "Tam Kỳ", "Hội An", "Tây Giang", "Đông Giang", "Đại Lộc", "Điện Bàn", "Duy Xuyên",
      "Quế Sơn", "Nam Giang", "Phước Sơn", "Hiệp Đức", "Thăng Bình", "Tiên Phước", "Bắc Trà My",
      "Nam Trà My", "Núi Thành", "Phú Ninh", "Nông Sơn"
    ],
    
    "Quảng Ngãi": [
      "Quảng Ngãi", "Bình Sơn", "Trà Bồng", "Sơn Tịnh", "Tư Nghĩa", "Sơn Hà", "Sơn Tây",
      "Minh Long", "Nghĩa Hành", "Mộ Đức", "Đức Phổ", "Ba Tơ", "Lý Sơn"
    ],
    
    "Quảng Ninh": [
      "Hạ Long", "Móng Cái", "Cẩm Phả", "Uông Bí", "Bình Liêu", "Tiên Yên", "Đầm Hà",
      "Hải Hà", "Ba Chẽ", "Vân Đồn", "Đông Triều", "Quảng Yên", "Cô Tô"
    ],
    
    "Quảng Trị": [
      "Đông Hà", "Quảng Trị", "Vĩnh Linh", "Hướng Hóa", "Gio Linh", "Đa Krông", "Cam Lộ", "Triệu Phong", "Hải Lăng"
    ],
    
    "Sóc Trăng": [
      "Sóc Trăng", "Châu Thành", "Kế Sách", "Mỹ Tú", "Cù Lao Dung", "Long Phú", "Mỹ Xuyên",
      "Thạnh Trị", "Vĩnh Châu", "Trần Đề"
    ],
    
    "Sơn La": [
      "Sơn La", "Quỳnh Nhai", "Thuận Châu", "Mường La", "Bắc Yên", "Phù Yên", "Mộc Châu",
      "Yên Châu", "Mai Sơn", "Sông Mã", "Sốp Cộp", "Vân Hồ"
    ],
    
    "Tây Ninh": [
      "Tây Ninh", "Tân Biên", "Tân Châu", "Dương Minh Châu", "Châu Thành", "Hòa Thành", "Gò Dầu", "Bến Cầu", "Trảng Bàng"
    ],
    
    "Thái Bình": [
      "Thái Bình", "Quỳnh Phụ", "Hưng Hà", "Đông Hưng", "Thái Thụy", "Tiền Hải", "Kiến Xương", "Vũ Thư"
    ],
    
    "Thái Nguyên": [
      "Thái Nguyên", "Sông Công", "Định Hóa", "Phú Lương", "Đồng Hỷ", "Võ Nhai", "Đại Từ",
      "Phổ Yên", "Phú Bình"
    ],
    
    "Thanh Hóa": [
      "Thanh Hóa", "Bỉm Sơn", "Sầm Sơn", "Mường Lát", "Quan Hóa", "Bá Thước", "Quan Sơn",
      "Lang Chánh", "Ngọc Lặc", "Cẩm Thủy", "Thạch Thành", "Hà Trung", "Vĩnh Lộc", "Yên Định",
      "Thọ Xuân", "Thường Xuân", "Triệu Sơn", "Thiệu Hóa", "Hoằng Hóa", "Hậu Lộc", "Nga Sơn",
      "Như Xuân", "Như Thanh", "Nông Cống", "Đông Sơn", "Quảng Xương", "Tĩnh Gia"
    ],
    
    "Thừa Thiên Huế": [
      "Huế", "Phong Điền", "Quảng Điền", "Phú Vang", "Hương Thủy", "Hương Trà", "A Lưới",
      "Phú Lộc", "Nam Đông"
    ],
    
    "Tiền Giang": [
      "Mỹ Tho", "Gò Công", "Cai Lậy", "Tân Phước", "Cái Bè", "Châu Thành", "Chợ Gạo", "Gò Công Đông", "Gò Công Tây"
    ],
    
    "Trà Vinh": [
      "Trà Vinh", "Càng Long", "Cầu Kè", "Tiểu Cần", "Châu Thành", "Cầu Ngang", "Trà Cú", "Duyên Hải"
    ],
    
    "Tuyên Quang": [
      "Tuyên Quang", "Lâm Bình", "Na Hang", "Chiêm Hóa", "Hàm Yên", "Yên Sơn", "Sơn Dương"
    ],
    
    "Vĩnh Long": [
      "Vĩnh Long", "Long Hồ", "Mang Thít", "Vũng Liêm", "Tam Bình", "Trà Ôn", "Bình Minh", "Bình Tân"
    ],
    
    "Vĩnh Phúc": [
      "Vĩnh Yên", "Phúc Yên", "Lập Thạch", "Tam Dương", "Tam Đảo", "Bình Xuyên", "Yên Lạc", "Vĩnh Tường"
    ],
    
    "Yên Bái": [
      "Yên Bái", "Nghĩa Lộ", "Lục Yên", "Văn Yên", "Mù Căng Chải", "Trấn Yên", "Trạm Tấu", "Văn Chấn", "Yên Bình"
    ]
  };

  const formatCurrency = v => {
    if (isNaN(v) || v === null) return '$0.00';
    return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const generateFakeQRCode = (method, amount) => {
    const data = `Pay ${method}: ${amount.toFixed(2)} USD. Order ID: ${orderData.orderId}`;
    return `https://quickchart.io/qr?text=${encodeURIComponent(data)}&size=150`;
  };

  // Load data từ localStorage (đồng bộ key với Cart)
  let orderData = {
    orderId: `ORD${Date.now()}`,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    engravingName: JSON.parse(localStorage.getItem('engravingName')) || null,
    discountPercent: JSON.parse(localStorage.getItem('discountPercent')) || 0,
    discountFixed: JSON.parse(localStorage.getItem('discountFixed')) || 0,
    shippingInfo: JSON.parse(localStorage.getItem('shippingInfo')) || null,
  };

  // Hàm kiểm tra sản phẩm đang sale (đồng bộ với Cart)
  function isSaleItem(item) {
    const price = Number(item.price || 0);
    const original = Number(item.originalPrice || 0);
    return (
      (original && original > price) ||
      item.isOnSale === true ||
      item.sale === true ||
      item.onSale === true
    );
  }

  // Calculate totals
  function calculateTotals() {
    const subtotal = orderData.cart.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
    const engravingFee = orderData.engravingName ? ENGRAVING_FEE_USD : 0;
    const subPlusEngraving = subtotal + engravingFee;
    const shipping = subPlusEngraving > 0 && subPlusEngraving < FREE_SHIPPING_THRESHOLD_USD ? SHIPPING_FEE_USD : 0;
    // Discount: áp dụng trên toàn bộ subtotal với thứ tự/capping cấu hình
    const percentValue = Math.max(Number(orderData.discountPercent) || 0, 0);
    const fixedValue = Math.max(Number(orderData.discountFixed) || 0, 0);
    let percentDeduction = 0;
    let fixedDeduction = 0;
    if (APPLY_PERCENT_FIRST) {
      percentDeduction = Math.round((subtotal * percentValue / 100) * 100) / 100;
      const remaining = Math.max(subtotal - percentDeduction, 0);
      fixedDeduction = ALLOW_FIXED_OVER_PERCENT ? fixedValue : Math.min(fixedValue, remaining);
    } else {
      fixedDeduction = fixedValue;
      const remainingForPercent = Math.max(subtotal - fixedDeduction, 0);
      percentDeduction = Math.round((remainingForPercent * percentValue / 100) * 100) / 100;
    }
    const discountAmount = Math.round((percentDeduction + fixedDeduction) * 100) / 100;
    const total = Math.round((subPlusEngraving - discountAmount + shipping) * 100) / 100;

    orderData.subtotal = subtotal;
    orderData.engravingFee = engravingFee;
    orderData.shipping = shipping;
    orderData.discountAmount = discountAmount;
    orderData.total = total;
  }

  // ==== USER SEGMENT HELPERS (ported from Cart) ====
  function getUserProfile() {
    const firstLoginDone = JSON.parse(localStorage.getItem('user.firstLoginDone') || 'false');
    const orderCount = Number(localStorage.getItem('user.orderCount') || '0');
    const birthMonth = Number(localStorage.getItem('user.birthMonth') || '0');
    const lifetimeSpend = Number(localStorage.getItem('user.lifetimeSpend') || '0');
    return { firstLoginDone, orderCount, birthMonth, lifetimeSpend };
  }

  function setFirstLoginDone() {
    localStorage.setItem('user.firstLoginDone', 'true');
  }

  function evaluateCoupon(code) {
    const nowMonth = new Date().getMonth() + 1;
    const profile = getUserProfile();
    const upper = (code || '').trim().toUpperCase();
    if (upper === 'WELCOME10') {
      if (!profile.firstLoginDone) {
        return { valid: true, type: 'percent', value: 10, message: '✅ 10% for first login' };
      }
      return { valid: false, message: '❌ Chỉ áp dụng lần đăng nhập đầu tiên.' };
    }
    if (upper === 'FIRSTBUY15') {
      if (profile.orderCount === 0) {
        return { valid: true, type: 'percent', value: 15, message: '✅ 15% for first purchase' };
      }
      return { valid: false, message: '❌ Chỉ áp dụng cho đơn hàng đầu tiên.' };
    }
    if (upper === 'BDAY20') {
      if (profile.birthMonth && profile.birthMonth === nowMonth) {
        return { valid: true, type: 'percent', value: 20, message: '✅ 20% trong tháng sinh nhật' };
      }
      return { valid: false, message: '❌ Mã chỉ áp dụng trong tháng sinh nhật.' };
    }
    if (upper === 'LOYAL5') {
      if (profile.lifetimeSpend >= 100) {
        return { valid: true, type: 'amount', value: 5, message: '✅ $5 cho khách thân thiết (>=$100)' };
      }
      return { valid: false, message: '❌ Cần tổng chi tiêu ≥ $100 để áp dụng.' };
    }
    if (upper === 'NEW15') {
      return { valid: true, type: 'percent', value: 15, message: '✅ 15% discount applied' };
    }
    return { valid: false, message: '❌ Mã không hợp lệ hoặc đã hết hạn.' };
  }

  // ✅ THÊM HÀM LOAD STATE/CITY
  function loadStateList() {
    const country = elements.country?.value || 'VN';
    const stateSelect = elements.state;
    if (!stateSelect) return;
    
    const list = country === "US" ? US_STATES : VN_PROVINCES;

    stateSelect.innerHTML = '<option value="">Select state/province</option>';
    list.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      stateSelect.appendChild(opt);
    });
    
    loadCityList(); // Reset city khi đổi state
  }

  function loadCityList() {
    const stateVal = elements.state?.value || '';
    const country = elements.country?.value || 'VN';
    const citySelect = elements.city;
    if (!citySelect) return;

    citySelect.innerHTML = '<option value="">Select city/district</option>';

    if (country === "US") {
      citySelect.innerHTML = '<option value="N/A">N/A</option>';
      return;
    }

    const districts = VN_DISTRICTS[stateVal] || [];
    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      citySelect.appendChild(opt);
    });
  }

  function updateCarrierByCountry() {
    const val = elements.country?.value || 'VN';
    if (elements.carrierLabel) {
      elements.carrierLabel.textContent = val === 'US' ? 'USPS / UPS' : 'LX Pantos';
    }
    const label = document.getElementById('countryLabelText');
    if (label) {
      label.textContent = val === 'US' ? 'UNITED STATES' : 'VIETNAM';
    }
  }
  // Elements
  const elements = {
    cartItemsEl: document.getElementById('cartItems'),
    emptyCartEl: document.getElementById('emptyCart'),
    subtotalEl: document.getElementById('subtotal'),
    shippingFeeEl: document.getElementById('shippingFee'),
    totalEl: document.getElementById('total'),
    discountEl: document.getElementById('discount'),
    engravingFeeEl: document.getElementById('engravingFee'),
    shippingDisplay: document.getElementById('shippingDisplay'),
    noShippingInfo: document.getElementById('noShippingInfo'),
    engravingInfo: document.getElementById('engravingInfo'),
    engravedNameCheckout: document.getElementById('engravedNameCheckout'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    confirmOrderBtn: document.getElementById('confirmOrderBtn'),
    overlay: document.getElementById('overlay'),
    successPopup: document.getElementById('successPopup'),
    closePopupBtn: document.getElementById('closePopupBtn'),
    orderIdEl: document.getElementById('orderId'),
    qrMomo: document.getElementById('qrMomo'),
    qrZalo: document.getElementById('qrZalo'),
    qrBank: document.getElementById('qrBank'),
    qrCod: document.getElementById('qrCod'),
    couponInput: document.getElementById('couponInputCheckout'),
    applyCouponBtn: document.getElementById('applyCouponBtnCheckout'),
    couponMessage: document.getElementById('couponMessageCheckout'),
    agreeAll: document.getElementById('agreeAll'),
    // Shipping form
    shippingForm: document.getElementById('shippingForm'),
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    addressLine: document.getElementById('addressLine'),
    aptSuite: document.getElementById('aptSuite'),
    city: document.getElementById('city'),
    state: document.getElementById('state'),
    zip: document.getElementById('zip'),
    defaultAddress: document.getElementById('defaultAddress'),
    saveShippingBtn: document.getElementById('saveShippingBtn'),
    // Contact info
    mobileNumber: document.getElementById('mobileNumber'),
    emailAddress: document.getElementById('emailAddress'),
    // Country & carrier
    country: document.getElementById('country'),
    carrierLabel: document.getElementById('carrierLabel'),
    // Layout helpers
    leftScroll: document.querySelector('.left-scroll'),
    rightSidebar: document.querySelector('.right-column .summary-section'),
  };

  const showMessage = (message, type = 'info') => {
    const colors = { success: '#16a34a', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: ${colors[type]}; color: white;
      padding: 12px 20px; border-radius: 8px; z-index: 1000; animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  function initializeCheckout() {
    console.log('🔧 Initializing checkout...');
    calculateTotals();
    if (!orderData.cart || orderData.cart.length === 0) {
      showNoOrderData();
      return;
    }
    renderCart();
    displayShippingInfo();
    displayEngravingInfo();
    updateTotals();
    setupEventListeners();
    handlePaymentChange();
    updateCarrierByCountry();
    syncLeftScrollHeight();
    showMessage('Checkout data loaded successfully!', 'success');
  }

  function showNoOrderData() {
    if (elements.emptyCartEl) elements.emptyCartEl.classList.remove('hidden');
    if (elements.shippingDisplay) elements.shippingDisplay.classList.add('hidden');
    if (elements.engravingInfo) elements.engravingInfo.classList.add('hidden');
    if (elements.noShippingInfo) elements.noShippingInfo.classList.remove('hidden');
    if (elements.confirmOrderBtn) {
      elements.confirmOrderBtn.disabled = true;
      elements.confirmOrderBtn.textContent = 'No Order Data';
      elements.confirmOrderBtn.style.background = '#ccc';
    }
    showMessage('No order found! Please return to the cart.', 'error');
  }

  function renderCart() {
    if (!elements.cartItemsEl) return;
    elements.cartItemsEl.innerHTML = '';
    if (!orderData.cart || orderData.cart.length === 0) {
      if (elements.emptyCartEl) elements.emptyCartEl.classList.remove('hidden');
      return;
    }
    if (elements.emptyCartEl) elements.emptyCartEl.classList.add('hidden');

    // Helper: resolve possible image paths similar to Cart page
    const logo = '/header_footer/images/LOGO.png';
    const resolveImageCandidates = (p) => {
      if (!p) return [logo];
      if (/^(https?:\/\/|data:|\/)/.test(p)) return [p];
      if (p.startsWith('../images/')) {
        const file = p.replace(/^\.\.\/images\//, '');
        return [
          '/Sale/images/' + file,
          '/categories/images/' + file,
          '/Best_Sellers/images/' + file,
          logo
        ];
      }
      if (p.startsWith('./images/')) {
        const file = p.replace(/^\.\/images\//, '');
        return [
          '/Best_Sellers/images/' + file,
          '/categories/images/' + file,
          '/Sale/images/' + file,
          logo
        ];
      }
      if (p.startsWith('images/')) {
        const file = p.replace(/^images\//, '');
        return [
          '/Sale/images/' + file,
          '/categories/images/' + file,
          '/Best_Sellers/images/' + file,
          logo
        ];
      }
      return [p, logo];
    };

    orderData.cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name || 'Product'}</div>
          <div class="cart-item-price-qty">${formatCurrency(item.price || 0)} x ${item.quantity || 0}</div>
        </div>
        <div class="cart-item-controls">
          <span style="font-weight: 600; color: #6B4C3B;">
            ${formatCurrency((item.price || 0) * (item.quantity || 0))}
          </span>
        </div>
      `;
      elements.cartItemsEl.appendChild(div);

      // Insert product image (with fallbacks) before info block
      const rawImg = item.image || (Array.isArray(item.images) ? item.images[0] : '') || logo;
      const imgCandidates = resolveImageCandidates(rawImg);
      const imgEl = document.createElement('img');
      imgEl.className = 'cart-item-img';
      imgEl.alt = item.name || 'Product image';
      let idx = 0;
      const tryNext = () => {
        if (idx >= imgCandidates.length) return;
        imgEl.src = imgCandidates[idx++];
      };
      imgEl.addEventListener('error', tryNext);
      tryNext();
      div.insertBefore(imgEl, div.firstChild);
    });
  }

  function displayShippingInfo() {
    // Luôn hiển thị form để khách tự điền trực tiếp
    if (elements.shippingForm) elements.shippingForm.classList.remove('hidden');
    if (elements.noShippingInfo) elements.noShippingInfo.classList.add('hidden');
    // Nếu đã có thông tin, chỉ cập nhật phần tóm tắt nhưng vẫn giữ form hiển thị
    if (orderData.shippingInfo && elements.shippingDisplay) {
      const info = orderData.shippingInfo;
      const setTextContent = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text || 'N/A';
      };
      setTextContent('displayFullname', info.fullname);
      setTextContent('displayPhone', info.phone);
      setTextContent('displayProvince', info.province);
      setTextContent('displayDistrict', info.district);
      setTextContent('displayAddress', info.address);
      // Mặc định: giữ phần tóm tắt ẩn để giao diện giống ảnh
      elements.shippingDisplay.classList.add('hidden');
    }
    syncLeftScrollHeight();
  }

  function displayEngravingInfo() {
    if (!elements.engravingInfo || !elements.engravedNameCheckout) return;
    if (orderData.engravingName && orderData.engravingFee > 0) {
      elements.engravedNameCheckout.textContent = orderData.engravingName;
      elements.engravingInfo.classList.remove('hidden');
    } else {
      elements.engravingInfo.classList.add('hidden');
    }
  }

  function updateTotals() {
    if (!orderData) return;
    const subtotal = orderData.subtotal || 0;
    const engravingFee = orderData.engravingFee || 0;
    const shipping = orderData.shipping || 0;
    const discountAmount = orderData.discountAmount || 0;
    const total = orderData.total || 0;
    const subPlusEngravingUSD = subtotal + engravingFee;
    const freeShippingText = 'Free';

    const updateElement = (element, value) => {
      if (element) element.textContent = value;
    };

    updateElement(elements.subtotalEl, formatCurrency(subtotal));
    updateElement(elements.engravingFeeEl, formatCurrency(engravingFee));
    updateElement(elements.shippingFeeEl, shipping === 0 ? freeShippingText : formatCurrency(shipping));
    // Save up: hiển thị số âm nếu cấu hình, vẫn đổi màu theo số tiền
    if (elements.discountEl) {
      elements.discountEl.classList.remove('saveup-positive', 'saveup-zero');
      const hasSaving = Number(discountAmount) > 0;
      elements.discountEl.classList.add(hasSaving ? 'saveup-positive' : 'saveup-zero');
      if (SHOW_SAVEUP_NEGATIVE && hasSaving) {
        updateElement(elements.discountEl, '- ' + formatCurrency(discountAmount));
      } else {
        updateElement(elements.discountEl, formatCurrency(discountAmount));
      }
    }
    updateElement(elements.totalEl, formatCurrency(total));

    if (elements.progressBar) {
      const progressPercent = Math.min((subPlusEngravingUSD / FREE_SHIPPING_THRESHOLD_USD) * 100, 100);
      elements.progressBar.style.width = `${progressPercent}%`;
    }

    if (elements.progressText) {
      if (shipping === 0 && (subtotal + engravingFee) > 0) {
        elements.progressText.textContent = "🎉 You've qualified for Free Shipping!";
        elements.progressText.style.color = '#16a34a';
      } else {
        const neededUSD = FREE_SHIPPING_THRESHOLD_USD - subPlusEngravingUSD;
        elements.progressText.textContent = `Add ${formatCurrency(neededUSD)} for free shipping`;
        elements.progressText.style.color = '#A0726A';
      }
    }
  }

  function handlePaymentChange() {
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    [elements.qrMomo, elements.qrZalo, elements.qrBank, elements.qrCod].forEach(el => {
      if (el) el.classList.add('hidden');
    });

    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) return;

    const method = selectedPayment.value;
    const totalAmount = orderData.total || 0;

    let qrCodeElement;
    let qrContainer;
    let message = '';

    switch (method) {
      case 'momo':
        qrContainer = elements.qrMomo;
        qrCodeElement = `<img src="${generateFakeQRCode('Momo', totalAmount)}" alt="Momo QR Code" width="150" height="150"/>`;
        message = `Scan the QR code to pay ${formatCurrency(totalAmount)}. Account: 039755xxxx.`;
        break;
      case 'zalo':
        qrContainer = elements.qrZalo;
        qrCodeElement = `<img src="${generateFakeQRCode('ZaloPay', totalAmount)}" alt="ZaloPay QR Code" width="150" height="150"/>`;
        message = `Scan the QR code to pay ${formatCurrency(totalAmount)}. Account: 039755xxxx.`;
        break;
      case 'bank':
        qrContainer = elements.qrBank;
        qrCodeElement = `<img src="${generateFakeQRCode('BankTransfer', totalAmount)}" alt="Bank Transfer QR Code" width="150" height="150"/>`;
        message = `Transfer ${formatCurrency(totalAmount)} to ACB Bank, Account: 123456789. Content: ${orderData.orderId}`;
        break;
      case 'cod':
        qrContainer = elements.qrCod;
        qrCodeElement = 'N/A';
        message = `You will pay ${formatCurrency(totalAmount)} to the delivery person upon arrival.`;
        break;
    }

    if (qrContainer) {
      qrContainer.innerHTML = `
        ${qrCodeElement !== 'N/A' ? `<div style="text-align: center; margin-bottom: 10px;">${qrCodeElement}</div>` : ''}
        <p style="font-size: 0.9em; text-align: center; color: #A0726A;">${message}</p>
      `;
      qrContainer.classList.remove('hidden');
    }
  }

  function setupEventListeners() {
    if (elements.confirmOrderBtn) {
      elements.confirmOrderBtn.addEventListener('click', confirmOrder);
    }
    if (elements.closePopupBtn) {
      elements.closePopupBtn.addEventListener('click', closePopup);
    }
    if (elements.overlay) {
      elements.overlay.addEventListener('click', closePopup);
    }
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
      radio.addEventListener('change', handlePaymentChange);
    });
    if (elements.applyCouponBtn && elements.couponInput && elements.couponMessage) {
      elements.applyCouponBtn.addEventListener('click', function() {
        const code = elements.couponInput.value.trim().toUpperCase();
        const result = evaluateCoupon(code);
        if (result.valid) {
          if (result.type === 'percent') {
            orderData.discountPercent = result.value;
            orderData.discountFixed = 0;
          } else {
            orderData.discountPercent = 0;
            orderData.discountFixed = result.value;
          }
          elements.couponMessage.textContent = result.message;
          elements.couponMessage.style.color = '#16a34a';
          showMessage(`Coupon '${code}' applied successfully!`, 'success');
          if (code === 'WELCOME10') setFirstLoginDone();
        } else {
          orderData.discountPercent = 0;
          orderData.discountFixed = 0;
          elements.couponMessage.textContent = result.message;
          elements.couponMessage.style.color = '#ef4444';
          showMessage(result.message, 'error');
        }
        elements.couponMessage.classList.remove('hidden');
        calculateTotals();
        updateTotals();
        localStorage.setItem('discountPercent', JSON.stringify(orderData.discountPercent));
        localStorage.setItem('discountFixed', JSON.stringify(orderData.discountFixed));
        syncLeftScrollHeight();
      });
    }

    // Gate Place Order by Agree to All
    if (elements.agreeAll && elements.confirmOrderBtn) {
      const syncPlaceOrderState = () => {
        elements.confirmOrderBtn.disabled = !elements.agreeAll.checked;
      };
      elements.agreeAll.addEventListener('change', syncPlaceOrderState);
      // Initial sync to honor default unchecked state
      syncPlaceOrderState();
    }

    // Contact info persistence
    if (elements.mobileNumber) {
      const storedMobile = localStorage.getItem('contactMobile') || '';
      elements.mobileNumber.value = storedMobile;
      elements.mobileNumber.addEventListener('input', e => {
        localStorage.setItem('contactMobile', e.target.value);
      });
    }
    if (elements.emailAddress) {
      const storedEmail = localStorage.getItem('contactEmail') || '';
      elements.emailAddress.value = storedEmail;
      elements.emailAddress.addEventListener('input', e => {
        localStorage.setItem('contactEmail', e.target.value);
      });
    }

    // Country change -> update carrier
    if (elements.country) {
      elements.country.addEventListener('change', () => {
        updateCarrierByCountry();
      });
    }

    // Uppercase State/Province live
    if (elements.state) {
      elements.state.addEventListener('input', e => {
        e.target.value = (e.target.value || '').toUpperCase();
      });
    }

    // Sync left column scroll height on resize
    window.addEventListener('resize', syncLeftScrollHeight);

    // Shipping form: Save & Continue
    if (elements.saveShippingBtn) {
      elements.saveShippingBtn.addEventListener('click', function() {
        const first = (elements.firstName?.value || '').trim();
        const last = (elements.lastName?.value || '').trim();
        const address1 = (elements.addressLine?.value || '').trim();
        const apt = (elements.aptSuite?.value || '').trim();
        const city = (elements.city?.value || '').trim();
        const state = (elements.state?.value || '').trim();
        const zip = (elements.zip?.value || '').trim();
        const isDefault = !!elements.defaultAddress?.checked;
        const countryVal = (elements.country?.value || 'VN');

        if (!first || !last || !address1 || !city || !state || !zip) {
          showMessage('Please fill all required fields (*) in Shipping Address!', 'error');
          return;
        }

        // Country-specific Zip/Postal validation
        const isUS = countryVal === 'US';
        const isVN = countryVal === 'VN';
        let zipValid = true;
        if (isUS) {
          zipValid = /^\d{5}(-\d{4})?$/.test(zip);
          if (!zipValid) {
            showMessage('US Zip must be 5 digits or 5-4 (e.g., 12345 or 12345-6789).', 'error');
            return;
          }
        } else if (isVN) {
          zipValid = /^\d{6}$/.test(zip);
          if (!zipValid) {
            showMessage('VN Postal Code phải gồm 6 chữ số.', 'error');
            return;
          }
        }

        const shippingInfo = {
          fullname: `${first} ${last}`.trim(),
          address: apt ? `${address1}, ${apt}` : address1,
          district: city,
          province: state.toUpperCase(),
          zip,
          country: countryVal === 'US' ? 'United States' : 'Vietnam',
          default: isDefault,
          phone: JSON.parse(localStorage.getItem('contactMobile') || 'null') || ''
        };
        orderData.shippingInfo = shippingInfo;
        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
        showMessage('Shipping address saved. You can continue.', 'success');
        // Sau khi lưu: vẫn giữ form hiển thị; cho phép xem tóm tắt nếu muốn
        if (elements.shippingDisplay) {
          elements.shippingDisplay.classList.remove('hidden');
        }
        displayShippingInfo();
        syncLeftScrollHeight();
      });
    }
  }

  function confirmOrder() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
      showMessage('Please select a payment method!', 'error');
      return;
    }

    const orderId = orderData.orderId || `ORD${Date.now()}`;
    if (elements.orderIdEl) elements.orderIdEl.textContent = orderId;

    if (elements.overlay) elements.overlay.classList.remove('hidden');
    if (elements.successPopup) elements.successPopup.classList.remove('hidden');

    localStorage.clear(); // Clear localStorage after order confirmation
    showMessage('Order confirmed successfully!', 'success');
  }

  function closePopup() {
    if (elements.overlay) elements.overlay.classList.add('hidden');
    if (elements.successPopup) elements.successPopup.classList.add('hidden');
    setTimeout(() => {
      window.location.href = '../../cart/cart.html';
    }, 1000);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  initializeCheckout();
  // Helpers
  function updateCarrierByCountry() {
    const val = elements.country?.value || 'VN';
    if (elements.carrierLabel) {
      elements.carrierLabel.textContent = val === 'US' ? 'USPS / UPS' : 'LX Pantos';
    }
    const label = document.getElementById('countryLabelText');
    if (label) {
      label.textContent = val === 'US' ? 'UNITED STATES' : 'VIETNAM';
    }
  }
  function syncLeftScrollHeight() {
    const sidebar = elements.rightSidebar || document.querySelector('.right-column .summary-section');
    const scroller = elements.leftScroll || document.querySelector('.left-scroll');
    if (sidebar && scroller) {
      const h = sidebar.offsetHeight;
      scroller.style.maxHeight = `${h}px`;
      scroller.style.overflowY = 'auto';
    }
  }
});
