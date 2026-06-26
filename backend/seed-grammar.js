/**
 * Seed ngữ pháp HSK 1-6 vào SQLite — không cần API key
 * Dùng: node seed-grammar.js
 */
const db = require('./database/db')

const data = [

// ═══════════════════════════════════════════════════════
// HSK 1 — 43 điểm ngữ pháp
// ═══════════════════════════════════════════════════════
{ hsk_level:1, stt:1,  pattern:'Đại từ nghi vấn 什么 /shénme/',
  explanation:'Dùng để hỏi người hoặc sự vật (cái gì, gì).',
  examples:[{chinese:'你叫什么名字？',pinyin:'Nǐ jiào shénme míngzi?',vietnamese:'Tên bạn là gì?'},{chinese:'你买什么？',pinyin:'Nǐ mǎi shénme?',vietnamese:'Bạn mua gì?'}]},

{ hsk_level:1, stt:2,  pattern:'Câu có từ 是 /shì/',
  explanation:'Biểu đạt thuộc tính, danh tính. Phủ định thêm 不 /bú/ phía trước.',
  examples:[{chinese:'我是老师。',pinyin:'Wǒ shì lǎoshī.',vietnamese:'Tôi là giáo viên.'},{chinese:'李月不是老师。',pinyin:'Lǐ Yuè bú shì lǎoshī.',vietnamese:'Lý Nguyệt không phải là giáo viên.'}]},

{ hsk_level:1, stt:3,  pattern:'Trợ từ nghi vấn 吗 /ma/',
  explanation:'Đặt cuối câu trần thuật để tạo câu hỏi nghi vấn.',
  examples:[{chinese:'你是学生吗？',pinyin:'Nǐ shì xuésheng ma?',vietnamese:'Bạn là học sinh phải không?'}]},

{ hsk_level:1, stt:4,  pattern:'Đại từ nghi vấn 哪 /nǎ/',
  explanation:'Dùng để hỏi về người hoặc sự vật, thường đi kèm lượng từ.',
  examples:[{chinese:'你是哪国人？',pinyin:'Nǐ shì nǎ guó rén?',vietnamese:'Bạn là người nước nào?'}]},

{ hsk_level:1, stt:5,  pattern:'Trợ từ kết cấu 的 /de/',
  explanation:'Biểu thị quan hệ sở hữu (của).',
  examples:[{chinese:'这是我的书。',pinyin:'Zhè shì wǒ de shū.',vietnamese:'Đây là sách của tôi.'}]},

{ hsk_level:1, stt:6,  pattern:'Trợ từ nghi vấn 呢 /ne/ (hỏi lại)',
  explanation:'Dùng cuối câu để hỏi lại, truy vấn tình huống đã đề cập.',
  examples:[{chinese:'我喜欢喝咖啡。你呢？',pinyin:'Wǒ xǐhuan hē kāfēi. Nǐ ne?',vietnamese:'Tôi thích uống cà phê. Còn bạn?'}]},

{ hsk_level:1, stt:7,  pattern:'Đại từ nghi vấn 几 /jǐ/',
  explanation:'Dùng để hỏi số lượng nhỏ, thường dưới 10.',
  examples:[{chinese:'你有几个汉语老师？',pinyin:'Nǐ yǒu jǐ ge Hànyǔ lǎoshī?',vietnamese:'Bạn có mấy giáo viên tiếng Hán?'}]},

{ hsk_level:1, stt:8,  pattern:'Cách diễn đạt các số dưới 100',
  explanation:'Số 11-99: (Số hàng chục) + 十 + (Số hàng đơn vị).',
  examples:[{chinese:'二十三',pinyin:'èr shí sān',vietnamese:'Hai mươi ba'}]},

{ hsk_level:1, stt:9,  pattern:'Trợ từ 了 /le/ (tình huống mới)',
  explanation:'Dùng cuối câu chỉ sự thay đổi, xuất hiện của tình huống mới.',
  examples:[{chinese:'我朋友的女儿今年四岁了。',pinyin:'Wǒ péngyou de nǚ\'ér jīnnián sì suì le.',vietnamese:'Con gái bạn tôi năm nay đã bốn tuổi rồi.'}]},

{ hsk_level:1, stt:10, pattern:'Động từ năng nguyện 会 /huì/ (khả năng học được)',
  explanation:'Diễn tả khả năng có được qua học hỏi. Phủ định: 不会.',
  examples:[{chinese:'我会写汉字。',pinyin:'Wǒ huì xiě Hànzì.',vietnamese:'Tôi biết viết chữ Hán.'}]},

{ hsk_level:1, stt:11, pattern:'Câu có vị ngữ là tính từ',
  explanation:'Vị ngữ là tính từ, thường dùng 很 /hěn/ làm phó từ mức độ. Phủ định dùng 不 /bù/.',
  examples:[{chinese:'你的汉语很好。',pinyin:'Nǐ de Hànyǔ hěn hǎo.',vietnamese:'Tiếng Hán của bạn rất tốt.'}]},

{ hsk_level:1, stt:12, pattern:'Đại từ nghi vấn 怎么 /zěnme/ (hỏi cách thức)',
  explanation:'Dùng để hỏi phương thức thực hiện hành động, đặt trước động từ.',
  examples:[{chinese:'这个汉字怎么读？',pinyin:'Zhège Hànzì zěnme dú?',vietnamese:'Chữ Hán này đọc như thế nào?'}]},

{ hsk_level:1, stt:13, pattern:'Diễn tả ngày tháng',
  explanation:'Thứ tự từ lớn đến nhỏ: năm → tháng → ngày/thứ.',
  examples:[{chinese:'9月1号，星期三。',pinyin:'Jiǔ yuè yī hào, xīngqī sān.',vietnamese:'Ngày 1 tháng 9, thứ Tư.'}]},

{ hsk_level:1, stt:14, pattern:'Câu có vị ngữ là danh từ',
  explanation:'Vị ngữ là danh từ/cụm danh từ, thường diễn tả tuổi tác, thời gian.',
  examples:[{chinese:'今天9月1号。',pinyin:'Jīntiān jiǔ yuè yī hào.',vietnamese:'Hôm nay là ngày 1 tháng 9.'}]},

{ hsk_level:1, stt:15, pattern:'Cấu trúc liên động từ',
  explanation:'Hành động 1 biểu thị phương thức/mục đích của hành động 2, cùng chủ thể.',
  examples:[{chinese:'我去图书馆看书。',pinyin:'Wǒ qù túshūguǎn kàn shū.',vietnamese:'Tôi đi thư viện đọc sách.'}]},

{ hsk_level:1, stt:16, pattern:'Động từ năng nguyện 想 /xiǎng/',
  explanation:'Biểu thị mong muốn hoặc dự định (muốn).',
  examples:[{chinese:'我想喝茶。',pinyin:'Wǒ xiǎng hē chá.',vietnamese:'Tôi muốn uống trà.'}]},

{ hsk_level:1, stt:17, pattern:'Đại từ nghi vấn 多少 /duōshao/',
  explanation:'Dùng để hỏi số lượng từ 10 trở lên, hoặc hỏi giá cả.',
  examples:[{chinese:'这个杯子多少钱？',pinyin:'Zhège bēizi duōshao qián?',vietnamese:'Cái cốc này bao nhiêu tiền?'}]},

{ hsk_level:1, stt:18, pattern:'Lượng từ 个 /gè/ và 口 /kǒu/',
  explanation:'个: lượng từ phổ biến nhất. 口: dùng cho số thành viên gia đình.',
  examples:[{chinese:'我家有四口人。',pinyin:'Wǒ jiā yǒu sì kǒu rén.',vietnamese:'Nhà tôi có bốn người.'}]},

{ hsk_level:1, stt:19, pattern:'Động từ 在 /zài/ (ở tại)',
  explanation:'Dùng để nói ai đó/cái gì đang ở đâu.',
  examples:[{chinese:'我朋友在学校。',pinyin:'Wǒ péngyou zài xuéxiào.',vietnamese:'Bạn tôi ở trường.'}]},

{ hsk_level:1, stt:20, pattern:'Đại từ nghi vấn 哪儿 /nǎr/',
  explanation:'Dùng để hỏi về vị trí của người hoặc vật (ở đâu).',
  examples:[{chinese:'你的杯子在哪儿？',pinyin:'Nǐ de bēizi zài nǎr?',vietnamese:'Cái cốc của bạn ở đâu?'}]},

{ hsk_level:1, stt:21, pattern:'Giới từ 在 /zài/ (địa điểm hành động)',
  explanation:'Dẫn xuất từ động từ 在, chỉ địa điểm nơi xảy ra hành động.',
  examples:[{chinese:'我在朋友家喝茶。',pinyin:'Wǒ zài péngyou jiā hē chá.',vietnamese:'Tôi uống trà ở nhà bạn.'}]},

{ hsk_level:1, stt:22, pattern:'Trợ từ 呢 /ne/ (hỏi vị trí)',
  explanation:'Dùng cuối câu, hỏi lại về vị trí hoặc truy vấn người/vật.',
  examples:[{chinese:'我的小猫呢？',pinyin:'Wǒ de xiǎomāo ne?',vietnamese:'Con mèo nhỏ của tôi đâu?'}]},

{ hsk_level:1, stt:23, pattern:'Câu có từ 有 /yǒu/',
  explanation:'Biểu thị sự tồn tại hoặc sở hữu (có). Phủ định dùng 没(有).',
  examples:[{chinese:'房间里没有人。',pinyin:'Fángjiān lǐ méi yǒu rén.',vietnamese:'Trong phòng không có ai.'}]},

{ hsk_level:1, stt:24, pattern:'Liên từ 和 /hé/',
  explanation:'Nối hai hoặc nhiều thành phần giống nhau (danh từ, đại từ).',
  examples:[{chinese:'哥哥和姐姐都在家。',pinyin:'Gēge hé jiějie dōu zài jiā.',vietnamese:'Anh trai và chị gái đều ở nhà.'}]},

{ hsk_level:1, stt:25, pattern:'Động từ năng nguyện 能 /néng/',
  explanation:'Biểu thị khả năng, năng lực hoặc sự cho phép (có thể).',
  examples:[{chinese:'我能说汉语。',pinyin:'Wǒ néng shuō Hànyǔ.',vietnamese:'Tôi có thể nói tiếng Trung.'}]},

{ hsk_level:1, stt:26, pattern:'请 /qǐng/',
  explanation:'Diễn tả lời đề nghị, yêu cầu lịch sự (mời).',
  examples:[{chinese:'请坐。',pinyin:'Qǐng zuò.',vietnamese:'Mời ngồi.'}]},

{ hsk_level:1, stt:27, pattern:'Cách diễn tả thời gian (giờ phút)',
  explanation:'Số giờ + 点 /diǎn/ + Số phút + 分 /fēn/',
  examples:[{chinese:'现在八点十八分。',pinyin:'Xiànzài bā diǎn shíbā fēn.',vietnamese:'Bây giờ là 8 giờ 18 phút.'}]},

{ hsk_level:1, stt:28, pattern:'Từ chỉ thời gian làm trạng ngữ',
  explanation:'Cụm từ chỉ thời điểm đứng trong câu bổ nghĩa cho hành động, trả lời "Khi nào?".',
  examples:[{chinese:'明天我们去公园。',pinyin:'Míngtiān wǒmen qù gōngyuán.',vietnamese:'Ngày mai chúng tôi đi công viên.'}]},

{ hsk_level:1, stt:29, pattern:'Danh từ 前 /qián/ (trước)',
  explanation:'Biểu thị khoảng thời gian trước thời điểm hiện tại.',
  examples:[{chinese:'三天前',pinyin:'sān tiān qián',vietnamese:'Ba ngày trước'}]},

{ hsk_level:1, stt:30, pattern:'Đại từ nghi vấn 怎么样 /zěnmeyàng/',
  explanation:'Hỏi về tính chất, trạng thái, ý kiến hoặc đề xuất.',
  examples:[{chinese:'这部电影怎么样？',pinyin:'Zhè bù diànyǐng zěnmeyàng?',vietnamese:'Bộ phim này như thế nào?'}]},

{ hsk_level:1, stt:31, pattern:'Câu có vị ngữ là kết cấu chủ-vị',
  explanation:'Vị ngữ là cụm từ có cấu trúc chủ-vị.',
  examples:[{chinese:'这本书内容很有趣。',pinyin:'Zhè běn shū nèiróng hěn yǒuqù.',vietnamese:'Cuốn sách này nội dung rất thú vị.'}]},

{ hsk_level:1, stt:32, pattern:'Phó từ chỉ mức độ 太 /tài/',
  explanation:'Diễn tả mức độ quá cao, thường đi kèm 了. Phủ định: 不太.',
  examples:[{chinese:'天气太冷了。',pinyin:'Tiānqì tài lěng le.',vietnamese:'Thời tiết lạnh quá rồi.'}]},

{ hsk_level:1, stt:33, pattern:'Động từ năng nguyện 会 /huì/ (dự đoán)',
  explanation:'Diễn tả khả năng xảy ra của một tình huống (dự đoán tương lai).',
  examples:[{chinese:'明天会下雨。',pinyin:'Míngtiān huì xiàyǔ.',vietnamese:'Ngày mai sẽ mưa.'}]},

{ hsk_level:1, stt:34, pattern:'Thán từ 喂 /wèi/',
  explanation:'Dùng để gọi, thu hút chú ý hoặc bắt đầu cuộc trò chuyện (đặc biệt qua điện thoại).',
  examples:[{chinese:'喂，李老师在家吗？',pinyin:'Wèi, Lǐ lǎoshī zài jiā ma?',vietnamese:'A lô, thầy Lý có ở nhà không?'}]},

{ hsk_level:1, stt:35, pattern:'Cấu trúc 在……呢 /zài...ne/',
  explanation:'Biểu thị hành động đang diễn ra (đang làm gì đó).',
  examples:[{chinese:'我在看书呢。',pinyin:'Wǒ zài kàn shū ne.',vietnamese:'Tôi đang đọc sách.'}]},

{ hsk_level:1, stt:36, pattern:'Cách đọc số điện thoại',
  explanation:'Đọc từng chữ số, số "1" đọc là /yāo/.',
  examples:[{chinese:'13851897623',pinyin:'yāo sān bā wǔ yāo bā jiǔ qī liù èr sān',vietnamese:'1385 189 7623'}]},

{ hsk_level:1, stt:37, pattern:'Trợ từ ngữ khí 吧 /ba/ (đề nghị)',
  explanation:'Đề nghị, khuyên bảo hoặc mệnh lệnh nhẹ nhàng.',
  examples:[{chinese:'我们走吧。',pinyin:'Wǒmen zǒu ba.',vietnamese:'Mình đi thôi.'}]},

{ hsk_level:1, stt:38, pattern:'Trợ từ 了 /le/ (hoàn thành)',
  explanation:'Dùng sau động từ/tính từ biểu thị sự việc đã xảy ra hay hoàn thành.',
  examples:[{chinese:'她去商店了。',pinyin:'Tā qù shāngdiàn le.',vietnamese:'Cô ấy đã đi cửa hàng rồi.'}]},

{ hsk_level:1, stt:39, pattern:'Danh từ 后 /hòu/ (sau)',
  explanation:'Biểu thị khoảng thời gian sau thời điểm được đề cập.',
  examples:[{chinese:'五点后',pinyin:'Wǔ diǎn hòu',vietnamese:'Sau 5 giờ'}]},

{ hsk_level:1, stt:40, pattern:'Trợ từ ngữ khí 啊 /a/',
  explanation:'Cuối câu trần thuật làm mềm mại, thân mật, nhấn mạnh hoặc bày tỏ cảm xúc.',
  examples:[{chinese:'小心啊！',pinyin:'Xiǎoxīn a!',vietnamese:'Cẩn thận đấy!'}]},

{ hsk_level:1, stt:41, pattern:'Phó từ 都 /dōu/',
  explanation:'Biểu thị sự bao gồm hoặc tổng hợp (đều, tất cả).',
  examples:[{chinese:'他们都喜欢看电视。',pinyin:'Tāmen dōu xǐhuan kàn diànshì.',vietnamese:'Họ đều thích xem TV.'}]},

{ hsk_level:1, stt:42, pattern:'Cấu trúc 是……的 (nhấn mạnh)',
  explanation:'Nhấn mạnh thời gian, địa điểm hoặc cách thức xảy ra sự việc đã biết.',
  examples:[{chinese:'我们是坐出租车来的。',pinyin:'Wǒmen shì zuò chūzūchē lái de.',vietnamese:'Chúng tôi đến bằng taxi.'}]},

{ hsk_level:1, stt:43, pattern:'Cách diễn tả ngày tháng đầy đủ',
  explanation:'Thứ tự: năm → tháng → ngày → thứ.',
  examples:[{chinese:'今天是2025年1月5号。',pinyin:'Jīntiān shì èr líng èr wǔ nián yī yuè wǔ hào.',vietnamese:'Hôm nay là ngày 5 tháng 1 năm 2025.'}]},

// ═══════════════════════════════════════════════════════
// HSK 2 — 44 điểm ngữ pháp
// ═══════════════════════════════════════════════════════
{ hsk_level:2, stt:1,  pattern:'Trợ động từ 要 /yào/',
  explanation:'Đứng trước động từ chính, diễn đạt ý chí, nguyện vọng hoặc sự cần thiết.',
  examples:[{chinese:'我要吃米饭。',pinyin:'Wǒ yào chī mǐfàn.',vietnamese:'Tôi muốn ăn cơm.'}]},

{ hsk_level:2, stt:2,  pattern:'Phó từ chỉ mức độ 最 /zuì/',
  explanation:'Biểu thị mức độ cao nhất trong phạm vi so sánh (nhất).',
  examples:[{chinese:'我最喜欢吃米饭。',pinyin:'Wǒ zuì xǐhuān chī mǐfàn.',vietnamese:'Tôi thích ăn cơm nhất.'}]},

{ hsk_level:2, stt:3,  pattern:'Cách diễn tả số lượng 几 /jǐ/',
  explanation:'Hỏi số lượng ít (dưới 10). Cấu trúc: 几 + Lượng từ + Danh từ.',
  examples:[{chinese:'你学中文学了几年了？',pinyin:'Nǐ xué Zhōngwén xué le jǐ nián le?',vietnamese:'Bạn học tiếng Trung được mấy năm rồi?'}]},

{ hsk_level:2, stt:4,  pattern:'Câu hỏi 是不是 /shì bú shì/',
  explanation:'Đưa ra phỏng đoán và muốn xác minh thêm.',
  examples:[{chinese:'是不是明天爸爸休息？',pinyin:'Shì bù shì míngtiān bàba xiūxi?',vietnamese:'Có phải ngày mai bố nghỉ không?'}]},

{ hsk_level:2, stt:5,  pattern:'Đại từ 每 /měi/',
  explanation:'Đi kèm danh từ/lượng từ/từ thời gian để chỉ tất cả thành viên trong nhóm (mỗi, hằng).',
  examples:[{chinese:'我每天六点起床。',pinyin:'Wǒ měi tiān liù diǎn qǐchuáng.',vietnamese:'Mỗi ngày tôi dậy lúc 6 giờ.'}]},

{ hsk_level:2, stt:6,  pattern:'Đại từ nghi vấn 多 /duō/',
  explanation:'Hỏi về độ cao, chiều dài, tuổi tác, khoảng cách, thời gian, giá cả.',
  examples:[{chinese:'你多大？',pinyin:'Nǐ duō dà?',vietnamese:'Bạn bao nhiêu tuổi?'}]},

{ hsk_level:2, stt:7,  pattern:'Cụm từ có 的 /de/',
  explanation:'Đại từ/tính từ/động từ + 的 tạo thành cụm danh từ thay thế danh từ đã biết.',
  examples:[{chinese:'这本书不是我的。',pinyin:'Zhè běn shū bú shì wǒ de.',vietnamese:'Cuốn sách này không phải của tôi.'}]},

{ hsk_level:2, stt:8,  pattern:'一下 /yí xià/',
  explanation:'Dùng sau động từ, biểu thị hành động ngắn ngủi (một chút).',
  examples:[{chinese:'你休息一下吧。',pinyin:'Nǐ xiūxī yíxià ba.',vietnamese:'Bạn nghỉ ngơi một chút đi.'}]},

{ hsk_level:2, stt:9,  pattern:'Phó từ ngữ khí 真 /zhēn/',
  explanation:'Nhấn mạnh mức độ cao của tính chất, bộc lộ cảm xúc chân thật.',
  examples:[{chinese:'你真好！',pinyin:'Nǐ zhēn hǎo!',vietnamese:'Bạn thật tốt!'}]},

{ hsk_level:2, stt:10, pattern:'Cấu trúc 是……的 /shì...de/ (nhấn mạnh quá khứ)',
  explanation:'Nhấn mạnh chi tiết (thời gian, địa điểm, cách thức) của sự việc đã xảy ra.',
  examples:[{chinese:'这本书是我买的。',pinyin:'Zhè běn shū shì wǒ mǎi de.',vietnamese:'Cuốn sách này là do tôi mua.'}]},

{ hsk_level:2, stt:11, pattern:'Cấu trúc ……的时候 /de shíhou/',
  explanation:'Chỉ thời điểm hoặc khoảng thời gian cụ thể khi sự việc xảy ra.',
  examples:[{chinese:'睡觉的时候，请保持安静。',pinyin:'Shuìjiào de shíhou, qǐng bǎochí ānjìng.',vietnamese:'Khi ngủ, hãy giữ yên lặng.'}]},

{ hsk_level:2, stt:12, pattern:'Phó từ 就 /jiù/ (kết luận)',
  explanation:'Biểu thị thừa nhận, kết luận hợp logic hoặc giải pháp.',
  examples:[{chinese:'你既然不喜欢这份工作，那就辞职吧。',pinyin:'Nǐ jìrán bù xǐhuan zhè fèn gōngzuò, nà jiù cízhí ba.',vietnamese:'Cậu đã không thích công việc này, vậy thì nghỉ việc đi.'}]},

{ hsk_level:2, stt:13, pattern:'Phó từ ngữ khí 还 /hái/ (còn được)',
  explanation:'Cấu trúc 还 + tính từ/hình dung từ diễn tả sự tán thành, chấp nhận được.',
  examples:[{chinese:'今天还挺冷的。',pinyin:'Jīntiān hái tǐng lěng de.',vietnamese:'Hôm nay còn khá lạnh đấy.'}]},

{ hsk_level:2, stt:14, pattern:'Phó từ chỉ mức độ 有点儿 /yǒudiǎnr/',
  explanation:'Diễn tả cảm xúc tiêu cực hay thái độ không hài lòng (hơi, một chút).',
  examples:[{chinese:'今天天气有点儿冷。',pinyin:'Jīntiān tiānqì yǒudiǎnr lěng.',vietnamese:'Hôm nay thời tiết hơi lạnh.'}]},

{ hsk_level:2, stt:15, pattern:'Đại từ nghi vấn 怎么 /zěnme/ (hỏi nguyên nhân)',
  explanation:'Hỏi nguyên nhân sự việc, thường diễn tả thái độ ngạc nhiên.',
  examples:[{chinese:'你怎么不高兴？',pinyin:'Nǐ zěnme bù gāoxìng?',vietnamese:'Sao bạn không vui?'}]},

{ hsk_level:2, stt:16, pattern:'Sự lặp lại lượng từ (AA / 一AA)',
  explanation:'Lặp lại lượng từ biểu thị "mỗi/từng", "từng cái một".',
  examples:[{chinese:'这些苹果个个都很甜。',pinyin:'Zhèxiē píngguǒ gègè dōu hěn tián.',vietnamese:'Những quả táo này quả nào cũng rất ngọt.'}]},

{ hsk_level:2, stt:17, pattern:'Cấu trúc 因为……所以…… /yīnwèi...suǒyǐ.../',
  explanation:'Một vế biểu thị nguyên nhân, một vế biểu thị kết quả.',
  examples:[{chinese:'因为天气不好，所以我没去商店。',pinyin:'Yīnwèi tiānqì bù hǎo, suǒyǐ wǒ méi qù shāngdiàn.',vietnamese:'Bởi vì thời tiết không tốt, nên tôi không đi cửa hàng.'}]},

{ hsk_level:2, stt:18, pattern:'Phó từ 还 /hái/ (vẫn còn tiếp diễn)',
  explanation:'Biểu thị hành động hoặc trạng thái vẫn đang tiếp diễn.',
  examples:[{chinese:'八点了，他还在睡觉。',pinyin:'Bā diǎn le, tā hái zài shuìjiào.',vietnamese:'Tám giờ rồi, anh ấy vẫn còn ngủ.'}]},

{ hsk_level:2, stt:19, pattern:'Phó từ thời gian 就 /jiù/ (sớm)',
  explanation:'Nhấn mạnh sự việc xảy ra sớm, thuận lợi.',
  examples:[{chinese:'电影七点开始，他六点就来了。',pinyin:'Diànyǐng qī diǎn kāishǐ, tā liù diǎn jiù lái le.',vietnamese:'Phim 7 giờ bắt đầu, anh ấy 6 giờ đã đến rồi.'}]},

{ hsk_level:2, stt:20, pattern:'Giới từ 离 /lí/ (khoảng cách)',
  explanation:'Biểu thị khoảng cách không gian hoặc thời gian giữa hai điểm.',
  examples:[{chinese:'我家离学校很远。',pinyin:'Wǒ jiā lí xuéxiào hěn yuǎn.',vietnamese:'Nhà tôi cách trường rất xa.'}]},

{ hsk_level:2, stt:21, pattern:'Trợ từ ngữ khí 呢 /ne/ (khẳng định)',
  explanation:'Cuối câu trần thuật, biểu thị sự khẳng định, tin tưởng.',
  examples:[{chinese:'八点上课，时间还早呢。',pinyin:'Bā diǎn shàngkè, shíjiān hái zǎo ne.',vietnamese:'Tám giờ vào lớp, thời gian vẫn còn sớm.'}]},

{ hsk_level:2, stt:22, pattern:'Câu hỏi ……好吗？ /hǎo ma/',
  explanation:'Hỏi ý kiến, quan điểm của người khác.',
  examples:[{chinese:'我们一起去吃饭，好吗？',pinyin:'Wǒmen yìqǐ qù chī fàn, hǎo ma?',vietnamese:'Chúng ta cùng đi ăn cơm nhé?'}]},

{ hsk_level:2, stt:23, pattern:'Phó từ 再 /zài/ (lặp lại)',
  explanation:'Biểu thị hành động lặp lại hoặc tiếp tục diễn ra.',
  examples:[{chinese:'你再看看这本书。',pinyin:'Nǐ zài kàn kàn zhè běn shū.',vietnamese:'Bạn xem lại cuốn sách này đi.'}]},

{ hsk_level:2, stt:24, pattern:'Câu kiêm ngữ (兼语句)',
  explanation:'Hai cụm động từ, động từ 1 thường là 请/让/叫. Cấu trúc: Chủ ngữ 1 + ĐT1 + Kiêm ngữ + ĐT2.',
  examples:[{chinese:'我请你吃饭。',pinyin:'Wǒ qǐng nǐ chī fàn.',vietnamese:'Tôi mời bạn ăn cơm.'}]},

{ hsk_level:2, stt:25, pattern:'Sự lặp lại động từ (ABAB)',
  explanation:'Biểu thị thời gian ngắn, nhẹ nhàng, thử.',
  examples:[{chinese:'我看看你的新手机。',pinyin:'Wǒ kànkan nǐ de xīn shǒujī.',vietnamese:'Tôi xem thử điện thoại mới của bạn.'}]},

{ hsk_level:2, stt:26, pattern:'Bổ ngữ chỉ kết quả',
  explanation:'Động từ/tính từ đứng sau động từ bổ sung kết quả của hành động.',
  examples:[{chinese:'大卫找到工作了。',pinyin:'Dàwèi zhǎo dào gōngzuò le.',vietnamese:'Đại Vệ đã tìm được việc làm rồi.'}]},

{ hsk_level:2, stt:27, pattern:'Giới từ 从 /cóng/',
  explanation:'Biểu thị điểm mốc khoảng thời gian, quãng đường hoặc trình tự.',
  examples:[{chinese:'从这儿到地铁站怎么走？',pinyin:'Cóng zhèr dào dìtiě zhàn zěnme zǒu?',vietnamese:'Từ đây đến ga tàu điện đi thế nào?'}]},

{ hsk_level:2, stt:28, pattern:'Cách diễn tả thứ tự 第…… /dì.../',
  explanation:'Dùng trước cụm từ chỉ số lượng để nói về thứ tự.',
  examples:[{chinese:'第一本书',pinyin:'Dì yī běn shū',vietnamese:'Cuốn sách thứ nhất'}]},

{ hsk_level:2, stt:29, pattern:'Câu cầu khiến 不要……了 / 别……了',
  explanation:'Biểu thị sự ngăn cản, cấm đoán làm việc gì đó.',
  examples:[{chinese:'不要玩手机了。',pinyin:'Bú yào wán shǒujī le.',vietnamese:'Đừng chơi điện thoại nữa.'}]},

{ hsk_level:2, stt:30, pattern:'Giới từ 对 /duì/',
  explanation:'Biểu thị mối quan hệ đối đãi giữa người/vật với người/vật.',
  examples:[{chinese:'跑步对身体很好。',pinyin:'Pǎobù duì shēntǐ hěn hǎo.',vietnamese:'Chạy bộ rất tốt cho sức khỏe.'}]},

{ hsk_level:2, stt:31, pattern:'Cấu trúc động từ/cụm động từ làm định ngữ',
  explanation:'Khi động từ dùng làm định ngữ, thêm 的 vào giữa định ngữ và trung tâm ngữ.',
  examples:[{chinese:'新买的自行车',pinyin:'xīn mǎi de zìxíngchē',vietnamese:'Chiếc xe đạp mới mua'}]},

{ hsk_level:2, stt:32, pattern:'Câu có từ 比 /bǐ/',
  explanation:'Dùng 比 biểu thị sự so sánh hơn kém.',
  examples:[{chinese:'今天比昨天热。',pinyin:'Jīntiān bǐ zuótiān rè.',vietnamese:'Hôm nay nóng hơn hôm qua.'}]},

{ hsk_level:2, stt:33, pattern:'Câu 比 diễn tả sự khác biệt cụ thể',
  explanation:'Dùng số lượng biểu thị mức độ khác biệt.',
  examples:[{chinese:'她比我们老师小两岁。',pinyin:'Tā bǐ wǒmen lǎoshī xiǎo liǎng suì.',vietnamese:'Cô ấy nhỏ hơn giáo viên của chúng tôi hai tuổi.'}]},

{ hsk_level:2, stt:34, pattern:'Trợ động từ 可能 /kěnéng/',
  explanation:'Biểu thị sự phỏng đoán, có lẽ, có thể.',
  examples:[{chinese:'你可能不认识他。',pinyin:'Nǐ kěnéng bù rènshi tā.',vietnamese:'Bạn có thể không quen biết anh ấy.'}]},

{ hsk_level:2, stt:35, pattern:'Bổ ngữ chỉ trạng thái (dùng 得)',
  explanation:'Mô tả kết quả, mức độ của hành động, dùng trợ từ 得.',
  examples:[{chinese:'他跑得很快。',pinyin:'Tā pǎo de hěn kuài.',vietnamese:'Anh ấy chạy rất nhanh.'}]},

{ hsk_level:2, stt:36, pattern:'Câu 比 với bổ ngữ trạng thái',
  explanation:'Kết hợp so sánh 比 với bổ ngữ trạng thái 得.',
  examples:[{chinese:'他比我学得好。',pinyin:'Tā bǐ wǒ xué de hǎo.',vietnamese:'Anh ấy học tốt hơn tôi.'}]},

{ hsk_level:2, stt:37, pattern:'Trợ động thái 着 /zhe/ (duy trì trạng thái)',
  explanation:'Đặt sau động từ, biểu thị sự duy trì của một trạng thái.',
  examples:[{chinese:'门开着。',pinyin:'Mén kāi zhe.',vietnamese:'Cửa đang mở.'}]},

{ hsk_level:2, stt:38, pattern:'Câu hỏi phản vấn 不是……吗？',
  explanation:'Dùng để nhắc nhở hoặc biểu thị sự không hiểu, không hài lòng.',
  examples:[{chinese:'不是你是北京人吗？',pinyin:'Bú shì nǐ shì Běijīng rén ma?',vietnamese:'Không phải bạn là người Bắc Kinh sao?'}]},

{ hsk_level:2, stt:39, pattern:'Giới từ 往 /wǎng/',
  explanation:'Thường dùng để chỉ phương hướng.',
  examples:[{chinese:'往左是医院，往右是银行。',pinyin:'Wǎng zuǒ shì yīyuàn, wǎng yòu shì yínháng.',vietnamese:'Rẽ trái là bệnh viện, rẽ phải là ngân hàng.'}]},

{ hsk_level:2, stt:40, pattern:'Trợ động thái 过 /guò/',
  explanation:'Đặt sau động từ, biểu thị kinh nghiệm đã trải qua trong quá khứ.',
  examples:[{chinese:'我看过那个电影。',pinyin:'Wǒ kàn guo nàge diànyǐng.',vietnamese:'Tôi đã từng xem bộ phim đó.'}]},

{ hsk_level:2, stt:41, pattern:'Cấu trúc 虽然……但是…… /suīrán...dànshì.../',
  explanation:'Kết nối hai vế câu theo quan hệ chuyển ngoặt (mặc dù...nhưng...).',
  examples:[{chinese:'虽然汉语很难，但是我很喜欢写汉字。',pinyin:'Suīrán Hànyǔ hěn nán, dànshì wǒ hěn xǐhuān xiě Hànzì.',vietnamese:'Mặc dù tiếng Hán khó, nhưng tôi rất thích viết chữ Hán.'}]},

{ hsk_level:2, stt:42, pattern:'Bổ ngữ chỉ tần suất 次 /cì/',
  explanation:'Đặt sau động từ, biểu thị số lần động tác xảy ra.',
  examples:[{chinese:'我们看过三次电影。',pinyin:'Wǒmen kàn guò sān cì diànyǐng.',vietnamese:'Chúng tôi đã xem phim ba lần.'}]},

{ hsk_level:2, stt:43, pattern:'Cấu trúc 要……了 /yào...le/ (sắp xảy ra)',
  explanation:'Diễn tả hành động/sự việc sắp diễn ra ngay lập tức.',
  examples:[{chinese:'火车要来了。',pinyin:'Huǒchē yào lái le.',vietnamese:'Tàu hỏa sắp đến rồi.'}]},

{ hsk_level:2, stt:44, pattern:'Cấu trúc 都……了 /dōu...le/',
  explanation:'Biểu thị "đã", thường chứa sự nhấn mạnh hoặc ngữ khí không hài lòng.',
  examples:[{chinese:'都8点了，快点儿起床吧。',pinyin:'Dōu bā diǎn le, kuài diǎnr qǐchuáng ba.',vietnamese:'Đã 8 giờ rồi, mau dậy đi.'}]},

// ═══════════════════════════════════════════════════════
// HSK 3 — 20 điểm ngữ pháp tiêu biểu
// ═══════════════════════════════════════════════════════
{ hsk_level:3, stt:1,  pattern:'Kết quả ngữ 好 /hǎo/',
  explanation:'Đặt sau động từ, biểu thị hành động hoàn thành và đạt kết quả thỏa đáng.',
  examples:[{chinese:'你准备好了吗？',pinyin:'Nǐ zhǔnbèi hǎo le ma?',vietnamese:'Bạn chuẩn bị xong chưa?'}]},

{ hsk_level:3, stt:2,  pattern:'Cấu trúc phủ định tuyệt đối 一……也/都 + 不/没',
  explanation:'Diễn tả sự phủ định hoàn toàn.',
  examples:[{chinese:'他一点儿也不累。',pinyin:'Tā yìdiǎnr yě bù lèi.',vietnamese:'Anh ấy một chút cũng không mệt.'}]},

{ hsk_level:3, stt:3,  pattern:'Liên từ 那 /nà/ (kết quả)',
  explanation:'Đặt đầu câu, chỉ kết quả hay nhận xét dựa vào nội dung đã đề cập.',
  examples:[{chinese:'A: 我不想去看电影。B: 那我也不去了。',pinyin:'Wǒ bù xiǎng qù kàn diànyǐng. Nà wǒ yě bù qù le.',vietnamese:'A: Tôi không muốn đi xem phim. B: Thế thì tôi cũng không đi nữa.'}]},

{ hsk_level:3, stt:4,  pattern:'Bổ ngữ chỉ phương hướng đơn giản',
  explanation:'Đặt sau động từ, biểu thị phương hướng hành động (上/下/进/出/回/过/起).',
  examples:[{chinese:'你上来吧。',pinyin:'Nǐ shàng lái ba.',vietnamese:'Bạn lên đây đi.'}]},

{ hsk_level:3, stt:5,  pattern:'Hai động tác liên tiếp: ĐT1 + 了 + 就 + ĐT2',
  explanation:'Hai hành động xảy ra liên tiếp nhau.',
  examples:[{chinese:'我下了课就吃饭。',pinyin:'Wǒ xià le kè jiù chī fàn.',vietnamese:'Tôi tan học là ăn cơm ngay.'}]},

{ hsk_level:3, stt:6,  pattern:'Phản vấn: 能……吗？',
  explanation:'Dùng để biểu thị sự phản đối, dạng khẳng định trong 能…吗 mang nghĩa phủ định.',
  examples:[{chinese:'你不做作业，也不练习，能学好吗？',pinyin:'Nǐ bù zuò zuòyè, yě bù liànxí, néng xué hǎo ma?',vietnamese:'Bạn không làm bài tập, cũng không luyện tập, làm sao mà học tốt được?'}]},

{ hsk_level:3, stt:7,  pattern:'还是 /háishì/ và 或者 /huòzhě/',
  explanation:'Cả hai biểu thị lựa chọn: 还是 dùng trong câu hỏi, 或者 dùng trong câu trần thuật.',
  examples:[{chinese:'你喜欢喝咖啡还是喝茶？',pinyin:'Nǐ xǐhuan hē kāfēi háishì hē chá?',vietnamese:'Bạn thích uống cà phê hay trà?'}]},

{ hsk_level:3, stt:8,  pattern:'Cấu trúc diễn tả sự tồn tại: địa điểm + 动词 + 着 + danh từ',
  explanation:'Biểu thị vị trí tồn tại của sự vật.',
  examples:[{chinese:'桌子上放着一杯咖啡。',pinyin:'Zhuōzi shàng fàng zhe yī bēi kāfēi.',vietnamese:'Trên bàn đặt một tách cà phê.'}]},

{ hsk_level:3, stt:9,  pattern:'Trợ động từ 会 /huì/ (khả năng xảy ra)',
  explanation:'Dùng trong câu biểu thị khả năng. Thường dùng cho sự việc chưa xảy ra.',
  examples:[{chinese:'你穿得那么少，会感冒的。',pinyin:'Nǐ chuān de nàme shǎo, huì gǎnmào de.',vietnamese:'Bạn mặc ít đồ như vậy, sẽ bị cảm lạnh đấy.'}]},

{ hsk_level:3, stt:10, pattern:'Cấu trúc 又……又…… /yòu...yòu.../',
  explanation:'Đề cập hai đặc điểm cùng tồn tại (vừa...vừa...).',
  examples:[{chinese:'这个西瓜又大又甜。',pinyin:'Zhège xīguā yòu dà yòu tián.',vietnamese:'Quả dưa hấu này vừa to vừa ngọt.'}]},

{ hsk_level:3, stt:11, pattern:'Động tác kèm trạng thái: ĐT1 + 着 + ĐT2',
  explanation:'Hai hành động xảy ra đồng thời, ĐT1 diễn tả trạng thái/cách thức của ĐT2.',
  examples:[{chinese:'她总是笑着跟客人说话。',pinyin:'Tā zǒng shì xiào zhe gēn kèrén shuōhuà.',vietnamese:'Cô ấy luôn cười nói chuyện với khách hàng.'}]},

{ hsk_level:3, stt:12, pattern:'Trợ từ chỉ sự thay đổi 了 /le/',
  explanation:'Biểu thị tình huống đã thay đổi hoặc xuất hiện tình huống mới.',
  examples:[{chinese:'我以前有钱，现在没钱了。',pinyin:'Wǒ yǐqián yǒu qián, xiànzài méi qián le.',vietnamese:'Trước đây tôi có tiền, giờ không có tiền nữa.'}]},

{ hsk_level:3, stt:13, pattern:'Cấu trúc 越来越 + tính từ/động từ trạng thái',
  explanation:'Biểu thị sự thay đổi mức độ theo thời gian (càng ngày càng...).',
  examples:[{chinese:'他的汉语说得越来越流利。',pinyin:'Tā de Hànyǔ shuō de yuè lái yuè liúlì.',vietnamese:'Tiếng Trung của anh ấy nói ngày một lưu loát.'}]},

{ hsk_level:3, stt:14, pattern:'Bổ ngữ chỉ khả năng: ĐT + 得/不 + Bổ ngữ',
  explanation:'Diễn tả khả năng có thể/không thể thực hiện kết quả nào đó.',
  examples:[{chinese:'你说慢一点儿，我听得懂。',pinyin:'Nǐ shuō màn yīdiǎnr, wǒ tīng de dǒng.',vietnamese:'Bạn nói chậm một chút, tôi có thể nghe hiểu.'}]},

{ hsk_level:3, stt:15, pattern:'Cấu trúc 把 /bǎ/',
  explanation:'Nhấn mạnh kết quả hoặc sự xử lý đối tượng. Cấu trúc: Chủ ngữ + 把 + Tân ngữ + Động từ.',
  examples:[{chinese:'请把书放在桌子上。',pinyin:'Qǐng bǎ shū fàng zài zhuōzi shàng.',vietnamese:'Hãy đặt sách lên bàn.'}]},

{ hsk_level:3, stt:16, pattern:'Cấu trúc 被 /bèi/ (câu bị động)',
  explanation:'Dùng để diễn đạt câu bị động. Cấu trúc: Chủ ngữ + 被 + Chủ thể hành động + Động từ.',
  examples:[{chinese:'我的钱包被人偷了。',pinyin:'Wǒ de qiánbāo bèi rén tōu le.',vietnamese:'Ví của tôi bị người ta lấy cắp rồi.'}]},

{ hsk_level:3, stt:17, pattern:'Cấu trúc 如果……就…… /rúguǒ...jiù.../',
  explanation:'Diễn tả quan hệ điều kiện (nếu...thì...).',
  examples:[{chinese:'如果明天下雨，我就不去了。',pinyin:'Rúguǒ míngtiān xià yǔ, wǒ jiù bù qù le.',vietnamese:'Nếu ngày mai trời mưa, tôi sẽ không đi nữa.'}]},

{ hsk_level:3, stt:18, pattern:'Phó từ 才 /cái/ (mới/chỉ)',
  explanation:'Biểu thị việc xảy ra muộn hơn dự kiến, hoặc số lượng/mức độ thấp hơn mong đợi.',
  examples:[{chinese:'他今天才来。',pinyin:'Tā jīntiān cái lái.',vietnamese:'Hôm nay anh ấy mới đến.'}]},

{ hsk_level:3, stt:19, pattern:'Cấu trúc 越……越…… /yuè...yuè.../',
  explanation:'Biểu thị hai sự thay đổi tỷ lệ thuận (càng...càng...).',
  examples:[{chinese:'天气越来越冷。',pinyin:'Tiānqì yuè lái yuè lěng.',vietnamese:'Thời tiết càng ngày càng lạnh.'}]},

{ hsk_level:3, stt:20, pattern:'Cấu trúc 连……都/也…… /lián...dōu/yě.../',
  explanation:'Nhấn mạnh mức độ cực đoan, thậm chí cái đơn giản nhất cũng...',
  examples:[{chinese:'他连饭都不吃。',pinyin:'Tā lián fàn dōu bù chī.',vietnamese:'Anh ấy thậm chí không ăn cơm.'}]},

// ═══════════════════════════════════════════════════════
// HSK 4 — 20 điểm ngữ pháp tiêu biểu
// ═══════════════════════════════════════════════════════
{ hsk_level:4, stt:1,  pattern:'不仅……而且/还…… /bùjǐn...érqiě/hái.../',
  explanation:'Liên từ tăng tiến: không những...mà còn...',
  examples:[{chinese:'他不仅会说汉语，而且还会写汉字。',pinyin:'Tā bùjǐn huì shuō Hànyǔ, érqiě hái huì xiě Hànzì.',vietnamese:'Anh ấy không những biết nói tiếng Hán, mà còn biết viết chữ Hán.'}]},

{ hsk_level:4, stt:2,  pattern:'从来 /cónglái/ (từ trước đến nay)',
  explanation:'Phó từ biểu thị từ trước đến nay đều như vậy, thường dùng trong câu phủ định.',
  examples:[{chinese:'我从来没去过日本。',pinyin:'Wǒ cónglái méi qù guo Rìběn.',vietnamese:'Tôi chưa từng đi Nhật Bản bao giờ.'}]},

{ hsk_level:4, stt:3,  pattern:'刚/刚才 /gāng/gāngcái/',
  explanation:'刚: hành động xảy ra cách đây không lâu. 刚才: danh từ chỉ thời gian ngắn trong quá khứ.',
  examples:[{chinese:'他刚来一会儿。',pinyin:'Tā gāng lái yīhuìr.',vietnamese:'Anh ấy vừa mới đến một lát.'}]},

{ hsk_level:4, stt:4,  pattern:'即使……也…… /jíshǐ...yě.../',
  explanation:'Liên từ giả định: cho dù (sự việc đã/chưa xảy ra), kết quả vẫn không thay đổi.',
  examples:[{chinese:'即使明天下雨，我们也要去爬山。',pinyin:'Jíshǐ míngtiān xià yǔ, wǒmen yě yào qù páshān.',vietnamese:'Cho dù ngày mai trời mưa, chúng tôi vẫn sẽ đi leo núi.'}]},

{ hsk_level:4, stt:5,  pattern:'(在)……上 /(zài)...shàng/',
  explanation:'Chỉ trên bề mặt vật thể hoặc phạm vi nào đó.',
  examples:[{chinese:'今天的工作上有很多问题。',pinyin:'Jīntiān de gōngzuò shàng yǒu hěnduō wèntí.',vietnamese:'Hôm nay có nhiều vấn đề về công việc.'}]},

{ hsk_level:4, stt:6,  pattern:'正好 /zhènghǎo/ (vừa vặn)',
  explanation:'Hình dung từ: vừa vặn. Phó từ: sự việc xảy ra đúng lúc, đúng thời điểm.',
  examples:[{chinese:'正好商场在打折，我们便买一台吧。',pinyin:'Zhènghǎo shāngchǎng zài dǎzhé, wǒmen biàn mǎi yī tái ba.',vietnamese:'Vừa hay trung tâm thương mại đang giảm giá, chúng ta mua một cái đi.'}]},

{ hsk_level:4, stt:7,  pattern:'差不多/几乎 /chàbùduō/jīhū/',
  explanation:'Phó từ biểu thị mức độ không khác biệt nhiều (gần như, xấp xỉ).',
  examples:[{chinese:'他俩差不多高。',pinyin:'Tā liǎng chàbùduō gāo.',vietnamese:'Hai người họ gần như cao bằng nhau.'}]},

{ hsk_level:4, stt:8,  pattern:'尽管 /jǐnguǎn/ (mặc dù - sự việc đã xảy ra)',
  explanation:'Liên từ: dù cho, mặc dù (sự việc đã xảy ra, kết quả/tình huống vế sau bất ngờ).',
  examples:[{chinese:'尽管这是一场误会，他仍然不开心。',pinyin:'Jǐnguǎn zhè shì yī chǎng wùhuì, tā réngráng bù kāixīn.',vietnamese:'Mặc dù đây là một sự hiểu lầm, anh ấy vẫn không vui.'}]},

{ hsk_level:4, stt:9,  pattern:'却 /què/ (trái lại)',
  explanation:'Phó từ biểu thị chuyển ý (nhưng mà, trái lại), nhẹ hơn 但是.',
  examples:[{chinese:'很多人虽然住在一个楼里，但却从来没说过话。',pinyin:'Hěn duō rén suīrán zhù zài yī gè lóu lǐ, dàn què cónglái méi shuō guò huà.',vietnamese:'Rất nhiều người dù sống cùng tòa nhà, nhưng lại chưa từng nói chuyện với nhau.'}]},

{ hsk_level:4, stt:10, pattern:'而 /ér/ (tăng tiến/tương phản)',
  explanation:'Liên từ nối hai vế câu, biểu thị tăng tiến hoặc tương phản.',
  examples:[{chinese:'他工作认真而高效。',pinyin:'Tā gōngzuò rènzhēn ér gāoxiào.',vietnamese:'Anh ấy làm việc nghiêm túc mà lại hiệu quả.'}]},

{ hsk_level:4, stt:11, pattern:'挺……的 /tǐng...de/',
  explanation:'Biểu thị mức độ khá/tương đối, sắc thái nhẹ nhàng tự nhiên.',
  examples:[{chinese:'昨天晚上去的那家饭馆味道挺好的。',pinyin:'Zuótiān wǎnshàng qù de nà jiā fànguǎn wèidào tǐng hǎo de.',vietnamese:'Quán ăn tối qua tôi đến khá ngon.'}]},

{ hsk_level:4, stt:12, pattern:'本来 /běnlái/ (vốn dĩ)',
  explanation:'Phó từ nói về trạng thái/sự việc ban đầu, trước khi có sự thay đổi.',
  examples:[{chinese:'这件事情本来应该听他的。',pinyin:'Zhè jiàn shìqing běnlái yīnggāi tīng tā de.',vietnamese:'Việc này vốn dĩ nên nghe lời anh ấy.'}]},

{ hsk_level:4, stt:13, pattern:'另外 /lìngwài/ (ngoài ra)',
  explanation:'Đại từ/Phó từ/Liên từ chỉ người/vật/nội dung ngoài phạm vi đã đề cập.',
  examples:[{chinese:'这家餐厅菜很好吃，另外，环境也很不错。',pinyin:'Zhè jiā cāntīng cài hěn hǎo chī, lìngwài, huánjìng yě hěn bùcuò.',vietnamese:'Nhà hàng này đồ ăn rất ngon, thêm vào đó, không gian cũng rất tuyệt.'}]},

{ hsk_level:4, stt:14, pattern:'首先……其次…… /shǒuxiān...qícì.../',
  explanation:'Dùng trong văn viết biểu thị trình tự (trước hết...sau đó...).',
  examples:[{chinese:'首先，我要感谢大家；其次，我想说……',pinyin:'Shǒuxiān, wǒ yào gǎnxiè dàjiā; qícì, wǒ xiǎng shuō...',vietnamese:'Trước hết, tôi muốn cảm ơn mọi người; sau đó, tôi muốn nói...'}]},

{ hsk_level:4, stt:15, pattern:'只要……就…… /zhǐyào...jiù.../',
  explanation:'Điều kiện đủ: chỉ cần...là...',
  examples:[{chinese:'只要你努力，就一定会成功。',pinyin:'Zhǐyào nǐ nǔlì, jiù yīdìng huì chénggōng.',vietnamese:'Chỉ cần bạn cố gắng, nhất định sẽ thành công.'}]},

{ hsk_level:4, stt:16, pattern:'除了……以外，还/都…… /chúle...yǐwài.../',
  explanation:'Biểu thị ngoài đối tượng đã nêu còn có thêm (还), hoặc chỉ có đối tượng đó (都).',
  examples:[{chinese:'除了汉语以外，她还会说英语。',pinyin:'Chúle Hànyǔ yǐwài, tā hái huì shuō Yīngyǔ.',vietnamese:'Ngoài tiếng Hán, cô ấy còn biết nói tiếng Anh.'}]},

{ hsk_level:4, stt:17, pattern:'不管……都/也…… /bùguǎn...dōu/yě.../',
  explanation:'Biểu thị bất kể điều kiện nào, kết quả vẫn vậy.',
  examples:[{chinese:'不管天气怎样，我们都要出发。',pinyin:'Bùguǎn tiānqì zěnyàng, wǒmen dōu yào chūfā.',vietnamese:'Bất kể thời tiết thế nào, chúng tôi cũng phải xuất phát.'}]},

{ hsk_level:4, stt:18, pattern:'为了 /wèile/ (vì mục đích)',
  explanation:'Giới từ biểu thị mục đích, lý do thực hiện hành động.',
  examples:[{chinese:'为了学好汉语，她每天练习两小时。',pinyin:'Wèile xué hǎo Hànyǔ, tā měitiān liànxí liǎng xiǎoshí.',vietnamese:'Để học tốt tiếng Hán, cô ấy luyện tập hai tiếng mỗi ngày.'}]},

{ hsk_level:4, stt:19, pattern:'对……来说 /duì...láishuō/',
  explanation:'Biểu thị nhận xét đối với một đối tượng cụ thể (đối với... mà nói).',
  examples:[{chinese:'对我来说，学汉语很有趣。',pinyin:'Duì wǒ láishuō, xué Hànyǔ hěn yǒuqù.',vietnamese:'Đối với tôi, học tiếng Hán rất thú vị.'}]},

{ hsk_level:4, stt:20, pattern:'以为 /yǐwéi/ (tưởng lầm)',
  explanation:'Biểu thị suy nghĩ/nhận định sai so với thực tế (tưởng là, cứ nghĩ).',
  examples:[{chinese:'我以为你今天不来了。',pinyin:'Wǒ yǐwéi nǐ jīntiān bù lái le.',vietnamese:'Tôi tưởng hôm nay bạn không đến nữa.'}]},

// ═══════════════════════════════════════════════════════
// HSK 5 — 15 điểm ngữ pháp tiêu biểu
// ═══════════════════════════════════════════════════════
{ hsk_level:5, stt:1,  pattern:'固然 /gùrán/ (dĩ nhiên là)',
  explanation:'Liên từ thừa nhận sự thật ở vế trước, nhưng vế sau có chuyển ý.',
  examples:[{chinese:'他固然聪明，但还需要努力。',pinyin:'Tā gùrán cōngmíng, dàn hái xūyào nǔlì.',vietnamese:'Anh ấy tuy thông minh, nhưng vẫn cần cố gắng.'}]},

{ hsk_level:5, stt:2,  pattern:'宁可……也不…… /nìngkě...yě bù.../',
  explanation:'Biểu thị sự lựa chọn chấp nhận cái xấu hơn để tránh cái tệ hơn (thà...còn hơn...).',
  examples:[{chinese:'宁可慢一点，也不要出错。',pinyin:'Nìngkě màn yīdiǎn, yě bù yào chūcuò.',vietnamese:'Thà chậm một chút, còn hơn là mắc lỗi.'}]},

{ hsk_level:5, stt:3,  pattern:'何况 /hékuàng/ (huống chi)',
  explanation:'Liên từ biểu thị tăng tiến mạnh: nếu A còn vậy, huống chi là B.',
  examples:[{chinese:'大人都做不到，何况小孩呢？',pinyin:'Dàrén dōu zuò bù dào, hékuàng xiǎohái ne?',vietnamese:'Người lớn còn làm không được, huống chi là trẻ con?'}]},

{ hsk_level:5, stt:4,  pattern:'以……为…… /yǐ...wéi.../',
  explanation:'Biểu thị lấy/dùng cái gì đó làm cơ sở, tiêu chuẩn.',
  examples:[{chinese:'这家公司以质量为第一。',pinyin:'Zhè jiā gōngsī yǐ zhìliàng wéi dì yī.',vietnamese:'Công ty này lấy chất lượng làm tiêu chí hàng đầu.'}]},

{ hsk_level:5, stt:5,  pattern:'从而 /cóng\'ér/ (từ đó mà)',
  explanation:'Liên từ biểu thị kết quả/mục đích được rút ra từ hành động vế trước.',
  examples:[{chinese:'我们要努力工作，从而实现目标。',pinyin:'Wǒmen yào nǔlì gōngzuò, cóng\'ér shíxiàn mùbiāo.',vietnamese:'Chúng ta cần làm việc chăm chỉ, từ đó thực hiện mục tiêu.'}]},

{ hsk_level:5, stt:6,  pattern:'既然 /jìrán/ (đã vậy thì)',
  explanation:'Liên từ thừa nhận sự thật đã xảy ra, rút ra kết luận hợp lý.',
  examples:[{chinese:'既然决定了，就认真去做吧。',pinyin:'Jìrán juédìng le, jiù rènzhēn qù zuò ba.',vietnamese:'Đã quyết định rồi, thì hãy nghiêm túc làm đi.'}]},

{ hsk_level:5, stt:7,  pattern:'与其……不如…… /yǔqí...bùrú.../',
  explanation:'So sánh hai lựa chọn, đề xuất lựa chọn thứ hai hay hơn (thà...không bằng...).',
  examples:[{chinese:'与其抱怨，不如行动。',pinyin:'Yǔqí bàoyuàn, bùrú xíngdòng.',vietnamese:'Thà hành động còn hơn là phàn nàn.'}]},

{ hsk_level:5, stt:8,  pattern:'相反 /xiāngfǎn/ (ngược lại)',
  explanation:'Biểu thị điều ngược lại với điều vừa nêu.',
  examples:[{chinese:'他没有生气，相反，他笑了。',pinyin:'Tā méiyǒu shēngqì, xiāngfǎn, tā xiào le.',vietnamese:'Anh ấy không tức giận, ngược lại, anh ấy cười.'}]},

{ hsk_level:5, stt:9,  pattern:'凡是……都…… /fánshì...dōu.../',
  explanation:'Biểu thị tổng quát hóa: hễ là...đều...',
  examples:[{chinese:'凡是努力的人，都会成功。',pinyin:'Fánshì nǔlì de rén, dōu huì chénggōng.',vietnamese:'Hễ là người chăm chỉ, đều sẽ thành công.'}]},

{ hsk_level:5, stt:10, pattern:'随着 /suízhe/ (cùng với sự thay đổi của)',
  explanation:'Giới từ biểu thị sự thay đổi đồng thời với sự thay đổi của đối tượng khác.',
  examples:[{chinese:'随着科技的发展，生活越来越方便。',pinyin:'Suízhe kējì de fāzhǎn, shēnghuó yuè lái yuè fāngbiàn.',vietnamese:'Cùng với sự phát triển của khoa học công nghệ, cuộc sống ngày càng tiện lợi.'}]},

{ hsk_level:5, stt:11, pattern:'之所以……是因为…… /zhī suǒyǐ...shì yīnwèi.../',
  explanation:'Nhấn mạnh nguyên nhân của kết quả đã biết.',
  examples:[{chinese:'他之所以成功，是因为他非常努力。',pinyin:'Tā zhī suǒyǐ chénggōng, shì yīnwèi tā fēicháng nǔlì.',vietnamese:'Sở dĩ anh ấy thành công là vì anh ấy rất cố gắng.'}]},

{ hsk_level:5, stt:12, pattern:'甚至 /shènzhì/ (thậm chí)',
  explanation:'Phó từ nhấn mạnh mức độ cực đoan, ví dụ điển hình nhất.',
  examples:[{chinese:'他努力学习，甚至连节假日也不休息。',pinyin:'Tā nǔlì xuéxí, shènzhì lián jiéjiàrì yě bù xiūxi.',vietnamese:'Anh ấy học tập chăm chỉ, thậm chí cả ngày lễ cũng không nghỉ.'}]},

{ hsk_level:5, stt:13, pattern:'于是 /yúshì/ (do đó, vì vậy)',
  explanation:'Liên từ biểu thị kết quả tự nhiên xảy ra sau vế trước.',
  examples:[{chinese:'他迟到了，于是向老师道歉。',pinyin:'Tā chídào le, yúshì xiàng lǎoshī dàoqiàn.',vietnamese:'Anh ấy đến muộn, vì vậy đã xin lỗi giáo viên.'}]},

{ hsk_level:5, stt:14, pattern:'反而 /fǎn\'ér/ (ngược lại, trái lại)',
  explanation:'Phó từ biểu thị kết quả ngược với mong đợi thông thường.',
  examples:[{chinese:'他越解释，别人反而越不相信。',pinyin:'Tā yuè jiěshì, biérén fǎn\'ér yuè bù xiāngxìn.',vietnamese:'Anh ấy càng giải thích, người khác lại càng không tin.'}]},

{ hsk_level:5, stt:15, pattern:'要不然/否则 /yào bùrán/fǒuzé/ (nếu không thì)',
  explanation:'Biểu thị hậu quả nếu điều kiện ở vế trước không được thực hiện.',
  examples:[{chinese:'快走吧，否则会迟到的。',pinyin:'Kuài zǒu ba, fǒuzé huì chídào de.',vietnamese:'Đi nhanh đi, nếu không sẽ bị muộn đấy.'}]},

// ═══════════════════════════════════════════════════════
// HSK 6 — 15 điểm ngữ pháp tiêu biểu
// ═══════════════════════════════════════════════════════
{ hsk_level:6, stt:1,  pattern:'诚然 /chéngrán/ (thật vậy, cố nhiên)',
  explanation:'Liên từ văn viết thừa nhận một sự thật, sau đó chuyển ý.',
  examples:[{chinese:'诚然，这个方案有缺点，但总体来说是可行的。',pinyin:'Chéngrán, zhège fāng\'àn yǒu quēdiǎn, dàn zǒngtǐ lái shuō shì kěxíng de.',vietnamese:'Cố nhiên, phương án này có khuyết điểm, nhưng nhìn chung vẫn khả thi.'}]},

{ hsk_level:6, stt:2,  pattern:'无论……都…… /wúlùn...dōu.../',
  explanation:'Bất luận/dù thế nào...cũng... (mạnh hơn 不管).',
  examples:[{chinese:'无论遇到什么困难，他都不放弃。',pinyin:'Wúlùn yùdào shénme kùnnán, tā dōu bù fàngqì.',vietnamese:'Dù gặp khó khăn gì, anh ấy cũng không bỏ cuộc.'}]},

{ hsk_level:6, stt:3,  pattern:'何 /hé/ (sao mà, biết bao)',
  explanation:'Đại từ nghi vấn dùng trong văn viết để hỏi/cảm thán về nguyên nhân, mức độ.',
  examples:[{chinese:'这又何必呢？',pinyin:'Zhè yòu hébì ne?',vietnamese:'Điều này lại cần thiết gì chứ?'}]},

{ hsk_level:6, stt:4,  pattern:'以致 /yǐzhì/ (đến mức, dẫn đến)',
  explanation:'Liên từ biểu thị kết quả tiêu cực xảy ra do nguyên nhân vế trước.',
  examples:[{chinese:'他过于自信，以致犯了很多错误。',pinyin:'Tā guòyú zìxìn, yǐzhì fàn le hěn duō cuòwù.',vietnamese:'Anh ấy quá tự tin, dẫn đến mắc rất nhiều sai lầm.'}]},

{ hsk_level:6, stt:5,  pattern:'毕竟 /bìjìng/ (xét cho cùng, rốt cuộc)',
  explanation:'Phó từ nhấn mạnh bản chất không thể thay đổi của sự việc.',
  examples:[{chinese:'他毕竟还是个孩子，我们要多包容他。',pinyin:'Tā bìjìng háishi ge háizi, wǒmen yào duō bāoróng tā.',vietnamese:'Xét cho cùng anh ấy vẫn còn là đứa trẻ, chúng ta cần độ lượng hơn với anh ấy.'}]},

{ hsk_level:6, stt:6,  pattern:'况且 /kuàngqiě/ (vả lại, hơn nữa)',
  explanation:'Liên từ thêm vào lý do/điều kiện bổ sung, tăng thêm sức thuyết phục.',
  examples:[{chinese:'这件事情很难，况且时间也不够。',pinyin:'Zhè jiàn shìqing hěn nán, kuàngqiě shíjiān yě bú gòu.',vietnamese:'Việc này rất khó, vả lại thời gian cũng không đủ.'}]},

{ hsk_level:6, stt:7,  pattern:'既……又…… /jì...yòu.../',
  explanation:'Biểu thị hai tính chất/hành động cùng tồn tại (vừa...vừa..., trong văn viết).',
  examples:[{chinese:'这个计划既合理又可行。',pinyin:'Zhège jìhuà jì hélǐ yòu kěxíng.',vietnamese:'Kế hoạch này vừa hợp lý lại vừa khả thi.'}]},

{ hsk_level:6, stt:8,  pattern:'何尝 /hécháng/ (chưa từng, nào phải)',
  explanation:'Phó từ phủ định mang tính cảm thán, biểu thị "không phải là không".',
  examples:[{chinese:'我何尝不想去？只是没有时间。',pinyin:'Wǒ hécháng bù xiǎng qù? Zhǐshì méiyǒu shíjiān.',vietnamese:'Nào phải tôi không muốn đi? Chỉ là không có thời gian thôi.'}]},

{ hsk_level:6, stt:9,  pattern:'就算……也…… /jiùsuàn...yě.../',
  explanation:'Giả định nhượng bộ: cho dù, dù thế nào đi nữa... (thông dụng trong khẩu ngữ).',
  examples:[{chinese:'就算很难，我也要坚持下去。',pinyin:'Jiùsuàn hěn nán, wǒ yě yào jiānchí xiàqù.',vietnamese:'Dù có khó đến đâu, tôi cũng sẽ kiên trì.'}]},

{ hsk_level:6, stt:10, pattern:'在……方面 /zài...fāngmiàn/',
  explanation:'Biểu thị lĩnh vực/khía cạnh được đề cập.',
  examples:[{chinese:'在语言学习方面，她有很多经验。',pinyin:'Zài yǔyán xuéxí fāngmiàn, tā yǒu hěn duō jīngyàn.',vietnamese:'Về lĩnh vực học ngôn ngữ, cô ấy có rất nhiều kinh nghiệm.'}]},

{ hsk_level:6, stt:11, pattern:'非……不可 /fēi...bùkě/',
  explanation:'Nhất thiết phải, không thể không... (nhấn mạnh tính bắt buộc tuyệt đối).',
  examples:[{chinese:'这件事非你去不可。',pinyin:'Zhè jiàn shì fēi nǐ qù bùkě.',vietnamese:'Việc này nhất thiết phải anh đi.'}]},

{ hsk_level:6, stt:12, pattern:'不得不 /bùdébù/ (không thể không)',
  explanation:'Biểu thị bắt buộc phải làm, không có lựa chọn nào khác.',
  examples:[{chinese:'为了生活，他不得不离开家乡。',pinyin:'Wèile shēnghuó, tā bùdébù líkāi jiāxiāng.',vietnamese:'Vì sinh kế, anh ấy không thể không rời xa quê hương.'}]},

{ hsk_level:6, stt:13, pattern:'一旦 /yīdàn/ (một khi, hễ mà)',
  explanation:'Liên từ biểu thị điều kiện có thể xảy ra, thường kèm hậu quả đáng kể.',
  examples:[{chinese:'一旦发现问题，要及时解决。',pinyin:'Yīdàn fāxiàn wèntí, yào jíshí jiějué.',vietnamese:'Một khi phát hiện vấn đề, cần giải quyết kịp thời.'}]},

{ hsk_level:6, stt:14, pattern:'难道 /nándào/ (chẳng lẽ, lẽ nào)',
  explanation:'Phó từ dùng trong câu hỏi tu từ, biểu thị sự ngạc nhiên hoặc phản bác.',
  examples:[{chinese:'难道你不知道这件事吗？',pinyin:'Nándào nǐ bù zhīdào zhè jiàn shì ma?',vietnamese:'Chẳng lẽ bạn không biết chuyện này sao?'}]},

{ hsk_level:6, stt:15, pattern:'可见 /kějiàn/ (có thể thấy, điều đó cho thấy)',
  explanation:'Liên từ dùng trong văn viết, rút ra kết luận từ bằng chứng đã nêu.',
  examples:[{chinese:'他每天都认真学习，可见他对未来很有规划。',pinyin:'Tā měitiān dōu rènzhēn xuéxí, kějiàn tā duì wèilái hěn yǒu guīhuà.',vietnamese:'Anh ấy ngày nào cũng học tập nghiêm túc, điều đó cho thấy anh ấy có kế hoạch rõ ràng cho tương lai.'}]},

]

// ─── Import vào SQLite ────────────────────────────────
const deleted = db.prepare('DELETE FROM grammar').run()
if (deleted.changes > 0) console.log(`🗑️   Đã xóa ${deleted.changes} điểm ngữ pháp cũ`)

const insert = db.prepare(`
  INSERT INTO grammar (hsk_level, stt, pattern, explanation, examples)
  VALUES (@hsk_level, @stt, @pattern, @explanation, @examples)
`)

const saveAll = db.transaction((items) => {
  let saved = 0
  for (const item of items) {
    insert.run({ ...item, examples: JSON.stringify(item.examples) })
    saved++
  }
  return saved
})

const saved = saveAll(data)
console.log(`✅  Đã import ${saved} điểm ngữ pháp`)

// Thống kê theo cấp
for (let lv = 1; lv <= 6; lv++) {
  const n = db.prepare('SELECT COUNT(*) as n FROM grammar WHERE hsk_level=?').get(lv).n
  console.log(`    HSK ${lv}: ${n} điểm`)
}

db.close()
