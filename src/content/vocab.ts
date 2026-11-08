/**
 * KHO TỪ VỰNG (SPEC 15) — dữ liệu học chính của Happy Farm English.
 * - Khóa = từ tiếng Anh viết thường (đúng như chữ được đọc).
 * - ipa: phiên âm giọng Mỹ (General American), kiểu từ điển Cambridge.
 * - vi: nghĩa tiếng Việt — CHỈ hiển thị, không bao giờ đọc to.
 * - emoji: hình hỗ trợ nghĩa.
 * Thêm từ mới: chỉ thêm dòng vào bảng, không cần sửa logic.
 */

export interface VocabEntry {
  en: string;
  ipa: string;
  vi: string;
  emoji: string;
}

export interface SentenceEntry {
  en: string;
  vi: string;
  emoji: string;
  /** Hình thư viện (VD con vật) thay cho emoji trong khung từ. */
  art?: string;
}

type Row = [en: string, ipa: string, vi: string, emoji: string];

const ROWS: Row[] = [
  // ----- Chào hỏi & chung -----
  ['hello', '/heˈloʊ/', 'Xin chào', '👋'],
  ['yummy', '/ˈjʌm.i/', 'Ngon quá', '😋'],
  ['coin', '/kɔɪn/', 'Đồng xu', '🪙'],
  ['buy', '/baɪ/', 'Mua', '🛒'],
  ['sell', '/sel/', 'Bán', '🧺'],
  ['mix', '/mɪks/', 'Trộn', '🥣'],
  ['more', '/mɔːr/', 'Thêm nữa', '➕'],
  ['full', '/fʊl/', 'Đầy rồi', '🈵'],
  ['hot', '/hɑːt/', 'Nóng', '🔥'],
  ['light on', '/laɪt ɑːn/', 'Bật đèn', '💡'],
  ['light off', '/laɪt ɑːf/', 'Tắt đèn', '🌑'],
  ['tick tock', '/ˈtɪk ˌtɑːk/', 'Tích tắc (tiếng đồng hồ)', '🕰️'],
  ['wash', '/wɑːʃ/', 'Rửa', '🫧'],
  ['sit', '/sɪt/', 'Ngồi', '🪑'],
  ['sleep', '/sliːp/', 'Ngủ', '😴'],
  ['eat', '/iːt/', 'Ăn', '😋'],
  ['cook', '/kʊk/', 'Nấu ăn', '🍳'],
  ['bake', '/beɪk/', 'Nướng bánh', '🔥'],
  ['play', '/pleɪ/', 'Chơi', '🧸'],

  // ----- Nông trại -----
  ['farm', '/fɑːrm/', 'Nông trại', '🚜'],
  ['farm animals', '/fɑːrm ˈæn.ɪ.məlz/', 'Động vật nông trại', '🐮'],
  ['tree', '/triː/', 'Cái cây', '🌳'],
  ['flower', '/ˈflaʊ.ɚ/', 'Bông hoa', '🌸'],
  ['garden', '/ˈɡɑːr.dən/', 'Khu vườn', '🏡'],
  ['water', '/ˈwɑː.t̬ɚ/', 'Nước / Tưới nước', '💧'],
  ['house', '/haʊs/', 'Ngôi nhà', '🏠'],
  ['pond', '/pɑːnd/', 'Cái ao', '🦆'],
  ['barn', '/bɑːrn/', 'Chuồng trại', '🏚️'],
  ['shop', '/ʃɑːp/', 'Cửa hàng', '🏪'],
  ['market', '/ˈmɑːr.kɪt/', 'Chợ', '🧺'],
  ['bakery', '/ˈbeɪ.kɚ.i/', 'Tiệm bánh', '🧁'],

  // ----- Làm vườn -----
  ['seed', '/siːd/', 'Hạt giống', '🌱'],
  ['seeds', '/siːdz/', 'Những hạt giống', '🌱'],
  ['plant', '/plænt/', 'Trồng cây / Cái cây', '🪴'],
  ['grow', '/ɡroʊ/', 'Lớn lên', '🌿'],
  ['harvest', '/ˈhɑːr.vɪst/', 'Thu hoạch', '🧺'],
  ['weeds', '/wiːdz/', 'Cỏ dại', '🌿'],

  // ----- Trái cây & rau -----
  ['apple', '/ˈæp.əl/', 'Quả táo', '🍎'],
  ['banana', '/bəˈnæn.ə/', 'Quả chuối', '🍌'],
  ['mango', '/ˈmæŋ.ɡoʊ/', 'Quả xoài', '🥭'],
  ['coconut', '/ˈkoʊ.kə.nʌt/', 'Quả dừa', '🥥'],
  ['orange', '/ˈɔːr.ɪndʒ/', 'Quả cam / Màu cam', '🍊'],
  ['strawberry', '/ˈstrɑːˌber.i/', 'Quả dâu tây', '🍓'],
  ['watermelon', '/ˈwɑː.t̬ɚˌmel.ən/', 'Quả dưa hấu', '🍉'],
  ['carrot', '/ˈker.ət/', 'Củ cà rốt', '🥕'],
  ['grape', '/ɡreɪp/', 'Quả nho', '🍇'],
  ['grapes', '/ɡreɪps/', 'Chùm nho', '🍇'],
  ['tomato', '/təˈmeɪ.t̬oʊ/', 'Quả cà chua', '🍅'],
  ['corn', '/kɔːrn/', 'Bắp ngô', '🌽'],
  ['sunflower', '/ˈsʌnˌflaʊ.ɚ/', 'Hoa hướng dương', '🌻'],

  // ----- Làm bánh & nấu ăn -----
  ['cake', '/keɪk/', 'Bánh kem', '🎂'],
  ['milk', '/mɪlk/', 'Sữa', '🥛'],
  ['egg', '/eɡ/', 'Quả trứng', '🥚'],
  ['sugar', '/ˈʃʊɡ.ɚ/', 'Đường', '🍬'],
  ['flour', '/flaʊ.ɚ/', 'Bột mì', '🌾'],
  ['butter', '/ˈbʌt̬.ɚ/', 'Bơ', '🧈'],
  ['chocolate', '/ˈtʃɑːk.lət/', 'Sô-cô-la', '🍫'],
  ['bread', '/bred/', 'Bánh mì', '🍞'],
  ['cookies', '/ˈkʊk.iz/', 'Bánh quy', '🍪'],
  ['pie', '/paɪ/', 'Bánh nướng nhân', '🥧'],
  ['pancakes', '/ˈpæn.keɪks/', 'Bánh kếp', '🥞'],
  ['milkshake', '/ˈmɪlk.ʃeɪk/', 'Sữa lắc', '🥤'],
  ['hot chocolate', '/ˌhɑːt ˈtʃɑːk.lət/', 'Sô-cô-la nóng', '☕'],
  ['strawberry cake', '/ˈstrɑːˌber.i keɪk/', 'Bánh kem dâu', '🍰'],
  ['chocolate cupcake', '/ˈtʃɑːk.lət ˈkʌp.keɪk/', 'Bánh cupcake sô-cô-la', '🧁'],
  ['soup', '/suːp/', 'Món súp', '🍲'],
  ['salad', '/ˈsæl.əd/', 'Món rau trộn', '🥗'],
  ['omelette', '/ˈɑːm.lət/', 'Trứng tráng', '🍳'],
  ['popcorn', '/ˈpɑːp.kɔːrn/', 'Bỏng ngô', '🍿'],
  ['juice', '/dʒuːs/', 'Nước ép', '🧃'],

  // ----- Động vật -----
  ['cow', '/kaʊ/', 'Con bò', '🐄'],
  ['chicken', '/ˈtʃɪk.ɪn/', 'Con gà', '🐔'],
  ['duck', '/dʌk/', 'Con vịt', '🦆'],
  ['pig', '/pɪɡ/', 'Con heo', '🐖'],
  ['sheep', '/ʃiːp/', 'Con cừu', '🐑'],
  ['horse', '/hɔːrs/', 'Con ngựa', '🐴'],
  ['dog', '/dɑːɡ/', 'Con chó', '🐶'],
  ['cat', '/kæt/', 'Con mèo', '🐱'],
  ['rabbit', '/ˈræb.ɪt/', 'Con thỏ', '🐰'],

  // ----- Trang phục & phụ kiện -----
  ['hat', '/hæt/', 'Cái mũ', '👒'],
  ['hats', '/hæts/', 'Những cái mũ', '👒'],
  ['cap', '/kæp/', 'Mũ lưỡi trai', '🧢'],
  ['sun hat', '/ˈsʌn ˌhæt/', 'Mũ rộng vành', '👒'],
  ['party hat', '/ˈpɑːr.t̬i ˌhæt/', 'Mũ tiệc', '🎉'],
  ['top hat', '/ˈtɑːp ˌhæt/', 'Mũ chóp cao', '🎩'],
  ['flower crown', '/ˈflaʊ.ɚ ˌkraʊn/', 'Vòng hoa đội đầu', '🌸'],
  ['crown', '/kraʊn/', 'Vương miện', '👑'],
  ['shirt', '/ʃɝːt/', 'Cái áo', '👕'],
  ['shirts', '/ʃɝːts/', 'Những cái áo', '👕'],
  ['red shirt', '/red ʃɝːt/', 'Áo màu đỏ', '👕'],
  ['green shirt', '/ɡriːn ʃɝːt/', 'Áo màu xanh lá', '👕'],
  ['striped shirt', '/straɪpt ʃɝːt/', 'Áo kẻ sọc', '👕'],
  ['star shirt', '/stɑːr ʃɝːt/', 'Áo hình ngôi sao', '⭐'],
  ['pants', '/pænts/', 'Cái quần', '👖'],
  ['blue jeans', '/ˌbluː ˈdʒiːnz/', 'Quần bò xanh', '👖'],
  ['pink overalls', '/pɪŋk ˈoʊ.vɚ.ɑːlz/', 'Quần yếm hồng', '👖'],
  ['purple overalls', '/ˈpɝː.pəl ˈoʊ.vɚ.ɑːlz/', 'Quần yếm tím', '👖'],
  ['yellow shorts', '/ˈjel.oʊ ʃɔːrts/', 'Quần đùi vàng', '🩳'],
  ['shoes', '/ʃuːz/', 'Đôi giày', '👟'],
  ['red sneakers', '/red ˈsniː.kɚz/', 'Giày thể thao đỏ', '👟'],
  ['blue shoes', '/bluː ʃuːz/', 'Giày xanh dương', '👞'],
  ['rain boots', '/ˈreɪn ˌbuːts/', 'Ủng đi mưa', '🥾'],
  ['pink sandals', '/pɪŋk ˈsæn.dəlz/', 'Dép quai hồng', '🩴'],
  ['bags', '/bæɡz/', 'Những cái túi', '🎒'],
  ['backpack', '/ˈbæk.pæk/', 'Ba lô', '🎒'],
  ['red backpack', '/red ˈbæk.pæk/', 'Ba lô đỏ', '🎒'],
  ['blue backpack', '/bluː ˈbæk.pæk/', 'Ba lô xanh', '🎒'],
  ['bunny backpack', '/ˈbʌn.i ˈbæk.pæk/', 'Ba lô hình thỏ', '🐰'],
  ['glasses', '/ˈɡlæs.ɪz/', 'Cái kính', '👓'],
  ['sunglasses', '/ˈsʌnˌɡlæs.ɪz/', 'Kính râm', '🕶️'],
  ['round glasses', '/raʊnd ˈɡlæs.ɪz/', 'Kính tròn', '👓'],
  ['heart glasses', '/hɑːrt ˈɡlæs.ɪz/', 'Kính trái tim', '💖'],
  ['bow tie', '/ˌboʊ ˈtaɪ/', 'Nơ đeo cổ', '🎀'],
  ['scarf', '/skɑːrf/', 'Khăn quàng cổ', '🧣'],

  ['star glasses', '/stɑːr ˈɡlæs.ɪz/', 'Kính ngôi sao', '⭐'],
  ['rainbow shirt', '/ˈreɪn.boʊ ʃɝːt/', 'Áo cầu vồng', '🌈'],
  ['hero cape', '/ˈhɪr.oʊ keɪp/', 'Áo choàng siêu nhân', '🦸'],

  // ----- Trang trí, trò chơi, phần thưởng -----
  ['flower pot', '/ˈflaʊ.ɚ ˌpɑːt/', 'Chậu hoa', '🪴'],
  ['bench', '/bentʃ/', 'Ghế dài', '🪑'],
  ['fountain', '/ˈfaʊn.tən/', 'Đài phun nước', '⛲'],
  ['birdhouse', '/ˈbɝːd.haʊs/', 'Nhà cho chim', '🐦'],
  ['rainbow', '/ˈreɪn.boʊ/', 'Cầu vồng', '🌈'],
  ['game', '/ɡeɪm/', 'Trò chơi', '🎲'],
  ['games', '/ɡeɪmz/', 'Các trò chơi', '🎲'],
  ['quests', '/kwests/', 'Nhiệm vụ', '📜'],
  ['rewards', '/rɪˈwɔːrdz/', 'Phần thưởng', '🎁'],
  ['star', '/stɑːr/', 'Ngôi sao', '⭐'],
  ['stars', '/stɑːrz/', 'Những ngôi sao', '⭐'],

  // ----- Trong nhà -----
  ['living room', '/ˈlɪv.ɪŋ ˌruːm/', 'Phòng khách', '🛋️'],
  ['bedroom', '/ˈbed.ruːm/', 'Phòng ngủ', '🛏️'],
  ['kitchen', '/ˈkɪtʃ.ən/', 'Nhà bếp', '🍳'],
  ['baking', '/ˈbeɪ.kɪŋ/', 'Làm bánh', '🧁'],
  ['sofa', '/ˈsoʊ.fə/', 'Ghế sofa', '🛋️'],
  ['book', '/bʊk/', 'Quyển sách', '📚'],
  ['piano', '/piˈæn.oʊ/', 'Đàn piano', '🎹'],
  ['clock', '/klɑːk/', 'Đồng hồ', '🕰️'],
  ['lamp', '/læmp/', 'Cái đèn', '💡'],
  ['bed', '/bed/', 'Cái giường', '🛏️'],
  ['wardrobe', '/ˈwɔːr.droʊb/', 'Tủ quần áo', '👕'],
  ['toys', '/tɔɪz/', 'Đồ chơi', '🧸'],
  ['bowl', '/boʊl/', 'Cái bát', '🥣'],
  ['mixing bowl', '/ˈmɪk.sɪŋ ˌboʊl/', 'Bát trộn bột', '🥣'],
  ['oven', '/ˈʌv.ən/', 'Lò nướng', '🔥'],
  ['sink', '/sɪŋk/', 'Bồn rửa', '🚰'],
  ['stove', '/stoʊv/', 'Bếp nấu', '🍳'],
  ['fridge', '/frɪdʒ/', 'Tủ lạnh', '🧊'],
  ['table', '/ˈteɪ.bəl/', 'Cái bàn', '🍽️'],
  ['dining table', '/ˈdaɪ.nɪŋ ˌteɪ.bəl/', 'Bàn ăn', '🍽️'],
  ['refrigerator', '/rɪˈfrɪdʒ.ə.reɪ.t̬ɚ/', 'Tủ lạnh', '🧊'],
  ['kitchen shelf', '/ˈkɪtʃ.ən ˌʃelf/', 'Kệ bếp', '🍽️'],
  ['spoon', '/spuːn/', 'Cái thìa', '🥄'],
  ['fork', '/fɔːrk/', 'Cái nĩa', '🍴'],
  ['plate', '/pleɪt/', 'Cái đĩa', '🍽️'],
  ['cup', '/kʌp/', 'Cái cốc', '☕'],
  ['pan', '/pæn/', 'Cái chảo', '🍳'],
  ['pot', '/pɑːt/', 'Cái nồi', '🍲'],
  ['television', '/ˈtel.ə.vɪʒ.ən/', 'Ti vi', '📺'],
  ['chair', '/tʃer/', 'Cái ghế', '🪑'],
  ['window', '/ˈwɪn.doʊ/', 'Cửa sổ', '🪟'],
  ['pillow', '/ˈpɪl.oʊ/', 'Cái gối', '🛏️'],
  ['blanket', '/ˈblæŋ.kɪt/', 'Cái chăn', '🛏️'],
  ['bathroom', '/ˈbæθ.ruːm/', 'Phòng tắm', '🛁'],
  ['toothbrush', '/ˈtuːθ.brʌʃ/', 'Bàn chải đánh răng', '🪥'],
  ['towel', '/ˈtaʊ.əl/', 'Khăn tắm', '🧺'],
  ['soap', '/soʊp/', 'Xà phòng', '🧼'],
  ['mirror', '/ˈmɪr.ɚ/', 'Cái gương', '🪞'],

  // ----- Vườn cây ăn quả -----
  ['orchard', '/ˈɔːr.tʃɚd/', 'Vườn cây ăn quả', '🍎'],
  ['apple tree', '/ˈæp.əl ˌtriː/', 'Cây táo', '🌳'],
  ['orange tree', '/ˈɔːr.ɪndʒ ˌtriː/', 'Cây cam', '🌳'],
  ['mango tree', '/ˈmæŋ.ɡoʊ ˌtriː/', 'Cây xoài', '🌳'],
  ['banana tree', '/bəˈnæn.ə ˌtriː/', 'Cây chuối', '🌴'],
  ['coconut tree', '/ˈkoʊ.kə.nʌt ˌtriː/', 'Cây dừa', '🌴'],
  ['strawberry plant', '/ˈstrɑː.ber.i ˌplænt/', 'Cây dâu tây', '🌱'],
  ['watermelon plant', '/ˈwɑː.t̬ɚˌmel.ən ˌplænt/', 'Cây dưa hấu', '🌱'],
  ['grapevine', '/ˈɡreɪp.vaɪn/', 'Giàn nho', '🍇'],
  ['basket', '/ˈbæs.kət/', 'Cái giỏ', '🧺'],

  // ----- HAPPY ZOO (giai đoạn 8, SPEC 19) -----
  ['zoo', '/zuː/', 'Sở thú', '🦁'],
  ['zookeeper', '/ˈzuːˌkiː.pɚ/', 'Người chăm sóc thú', '🧺'],
  ['map', '/mæp/', 'Bản đồ', '🗺️'],
  ['lion', '/ˈlaɪ.ən/', 'Sư tử', '🦁'],
  ['elephant', '/ˈel.ə.fənt/', 'Con voi', '🐘'],
  ['giraffe', '/dʒɪˈræf/', 'Hươu cao cổ', '🦒'],
  ['zebra', '/ˈziː.brə/', 'Ngựa vằn', '🦓'],
  ['rhinoceros', '/raɪˈnɑː.sɚ.əs/', 'Tê giác', '🦏'],
  ['monkey', '/ˈmʌŋ.ki/', 'Con khỉ', '🐒'],
  ['tiger', '/ˈtaɪ.ɡɚ/', 'Con hổ', '🐯'],
  ['bear', '/ber/', 'Con gấu', '🐻'],
  ['deer', '/dɪr/', 'Con hươu', '🦌'],
  ['fox', '/fɑːks/', 'Con cáo', '🦊'],
  ['penguin', '/ˈpeŋ.ɡwɪn/', 'Chim cánh cụt', '🐧'],
  ['polar bear', '/ˈpoʊ.lɚ ˌber/', 'Gấu Bắc Cực', '🐻‍❄️'],
  ['seal', '/siːl/', 'Hải cẩu', '🦭'],
  ['dolphin', '/ˈdɑːl.fɪn/', 'Cá heo', '🐬'],
  ['shark', '/ʃɑːrk/', 'Cá mập', '🦈'],
  ['turtle', '/ˈtɝː.t̬əl/', 'Rùa biển', '🐢'],
  ['octopus', '/ˈɑːk.tə.pʊs/', 'Bạch tuộc', '🐙'],
  ['clownfish', '/ˈklaʊn.fɪʃ/', 'Cá hề', '🐠'],
  ['parrot', '/ˈper.ət/', 'Con vẹt', '🦜'],
  ['peacock', '/ˈpiː.kɑːk/', 'Chim công', '🦚'],
  ['flamingo', '/fləˈmɪŋ.ɡoʊ/', 'Hồng hạc', '🦩'],
  ['owl', '/aʊl/', 'Cú mèo', '🦉'],
  // tiếng kêu
  ['roar', '/rɔːr/', 'Tiếng gầm', '🦁'],
  ['trumpet', '/ˈtrʌm.pɪt/', 'Tiếng rống (voi)', '🐘'],
  ['growl', '/ɡraʊl/', 'Tiếng gừ', '🐻'],
  ['hoot', '/huːt/', 'Tiếng cú kêu', '🦉'],
  ['squawk', '/skwɑːk/', 'Tiếng chim kêu quác', '🦜'],
  ['honk', '/hɑːŋk/', 'Tiếng kêu "hông"', '🦩'],
  ['bark', '/bɑːrk/', 'Tiếng sủa', '🦭'],
  ['neigh', '/neɪ/', 'Tiếng hí', '🐴'],
  ['moo', '/muː/', 'Tiếng bò kêu', '🐄'],
  ['quack', '/kwæk/', 'Tiếng vịt kêu', '🦆'],
  ['meow', '/miˈaʊ/', 'Tiếng mèo kêu', '🐱'],
  ['woof', '/wʊf/', 'Tiếng chó sủa', '🐶'],
  // thức ăn
  ['meat', '/miːt/', 'Thịt', '🍖'],
  ['hay', '/heɪ/', 'Cỏ khô', '🌾'],
  ['leaves', '/liːvz/', 'Lá cây', '🌿'],
  ['grass', '/ɡræs/', 'Cỏ', '🌱'],
  ['honey', '/ˈhʌn.i/', 'Mật ong', '🍯'],
  ['berries', '/ˈber.iz/', 'Quả mọng', '🫐'],
  ['fish', '/fɪʃ/', 'Con cá', '🐟'],
  ['seaweed', '/ˈsiː.wiːd/', 'Rong biển', '🌿'],
  ['shrimp', '/ʃrɪmp/', 'Con tôm', '🦐'],
  ['bugs', '/bʌɡz/', 'Côn trùng nhỏ', '🐛'],
  // bộ phận cơ thể
  ['trunk', '/trʌŋk/', 'Vòi (voi)', '🐘'],
  ['mane', '/meɪn/', 'Bờm', '🦁'],
  ['horn', '/hɔːrn/', 'Sừng', '🦏'],
  ['neck', '/nek/', 'Cổ', '🦒'],
  ['stripes', '/straɪps/', 'Sọc vằn', '🦓'],
  ['tail', '/teɪl/', 'Cái đuôi', '🐒'],
  ['paw', '/pɑː/', 'Bàn chân thú', '🐾'],
  ['antlers', '/ˈænt.lɚz/', 'Gạc hươu', '🦌'],
  ['wings', '/wɪŋz/', 'Đôi cánh', '🪽'],
  ['flippers', '/ˈflɪp.ɚz/', 'Chân chèo', '🦭'],
  ['fin', '/fɪn/', 'Vây cá', '🦈'],
  ['shell', '/ʃel/', 'Mai rùa', '🐢'],
  ['tentacles', '/ˈten.t̬ə.kəlz/', 'Xúc tu', '🐙'],
  ['beak', '/biːk/', 'Cái mỏ', '🦜'],
  ['feathers', '/ˈfeð.ɚz/', 'Lông vũ', '🪶'],
  ['legs', '/leɡz/', 'Đôi chân', '🦩'],
  ['eyes', '/aɪz/', 'Đôi mắt', '👀'],
  // nơi sống
  ['grassland', '/ˈɡræs.lænd/', 'Đồng cỏ', '🌾'],
  ['forest', '/ˈfɔːr.ɪst/', 'Khu rừng', '🌲'],
  ['ice', '/aɪs/', 'Băng giá', '❄️'],
  ['ocean', '/ˈoʊ.ʃən/', 'Đại dương', '🌊'],
  ['lake', '/leɪk/', 'Cái hồ', '🏞️'],
  ['nest', '/nest/', 'Cái tổ', '🪺'],
  ['birds', '/bɝːdz/', 'Các loài chim', '🐦'],
  // hoạt động
  ['eating', '/ˈiː.t̬ɪŋ/', 'Đang ăn', '😋'],
  ['drinking', '/ˈdrɪŋ.kɪŋ/', 'Đang uống', '💧'],
  ['sleeping', '/ˈsliː.pɪŋ/', 'Đang ngủ', '😴'],
  ['swimming', '/ˈswɪm.ɪŋ/', 'Đang bơi', '🏊'],
  ['flying', '/ˈflaɪ.ɪŋ/', 'Đang bay', '🕊️'],
  ['climbing', '/ˈklaɪ.mɪŋ/', 'Đang leo trèo', '🧗'],
  ['playing', '/ˈpleɪ.ɪŋ/', 'Đang chơi', '⚽'],
  ['walking', '/ˈwɑː.kɪŋ/', 'Đang đi bộ', '🚶'],
  ['running', '/ˈrʌn.ɪŋ/', 'Đang chạy', '🏃'],
  ['jumping', '/ˈdʒʌm.pɪŋ/', 'Đang nhảy', '🤸'],

  // ----- Đồ chơi -----
  ['ball', '/bɑːl/', 'Quả bóng', '⚽'],
  ['teddy bear', '/ˈted.i ˌber/', 'Gấu bông', '🧸'],
  ['kite', '/kaɪt/', 'Con diều', '🪁'],
  ['blocks', '/blɑːks/', 'Khối xếp hình', '🧱'],
  ['car', '/kɑːr/', 'Xe ô tô', '🚗'],
  ['robot', '/ˈroʊ.bɑːt/', 'Người máy', '🤖'],
  ['balloon', '/bəˈluːn/', 'Quả bóng bay', '🎈'],

  // ----- Màu sắc -----
  ['red', '/red/', 'Màu đỏ', '🔴'],
  ['yellow', '/ˈjel.oʊ/', 'Màu vàng', '🟡'],
  ['blue', '/bluː/', 'Màu xanh dương', '🔵'],
  ['green', '/ɡriːn/', 'Màu xanh lá', '🟢'],
  ['pink', '/pɪŋk/', 'Màu hồng', '🌸'],
  ['white', '/waɪt/', 'Màu trắng', '⚪'],
  ['purple', '/ˈpɝː.pəl/', 'Màu tím', '🟣'],
  ['brown', '/braʊn/', 'Màu nâu', '🟤'],

  // ----- Số -----
  ['one', '/wʌn/', 'Số một', '1️⃣'],
  ['two', '/tuː/', 'Số hai', '2️⃣'],
  ['three', '/θriː/', 'Số ba', '3️⃣'],
  ['four', '/fɔːr/', 'Số bốn', '4️⃣'],
  ['five', '/faɪv/', 'Số năm', '5️⃣'],
  ['six', '/sɪks/', 'Số sáu', '6️⃣'],
  ['seven', '/ˈsev.ən/', 'Số bảy', '7️⃣'],
  ['eight', '/eɪt/', 'Số tám', '8️⃣'],
  ['nine', '/naɪn/', 'Số chín', '9️⃣'],
  ['ten', '/ten/', 'Số mười', '🔟'],
  ['eleven', '/əˈlev.ən/', 'Số mười một', '1️⃣1️⃣'],
  ['twelve', '/twelv/', 'Số mười hai', '1️⃣2️⃣'],
  ['thirteen', '/θɝːˈtiːn/', 'Số mười ba', '1️⃣3️⃣'],
  ['fourteen', '/ˌfɔːrˈtiːn/', 'Số mười bốn', '1️⃣4️⃣'],
  ['fifteen', '/ˌfɪfˈtiːn/', 'Số mười lăm', '1️⃣5️⃣'],
  ['sixteen', '/ˌsɪkˈstiːn/', 'Số mười sáu', '1️⃣6️⃣'],
  ['seventeen', '/ˌsev.ənˈtiːn/', 'Số mười bảy', '1️⃣7️⃣'],
  ['eighteen', '/ˌeɪˈtiːn/', 'Số mười tám', '1️⃣8️⃣'],
  ['nineteen', '/ˌnaɪnˈtiːn/', 'Số mười chín', '1️⃣9️⃣'],
  ['twenty', '/ˈtwen.t̬i/', 'Số hai mươi', '2️⃣0️⃣'],

  // ----- Tên chủ đề trong sách tranh -----
  ['animals', '/ˈæn.ɪ.məlz/', 'Động vật', '🐮'],
  ['colors', '/ˈkʌl.ɚz/', 'Màu sắc', '🎨'],
  ['numbers', '/ˈnʌm.bɚz/', 'Các con số', '🔢'],
  ['fruits', '/fruːts/', 'Trái cây', '🍓'],
  ['gardening', '/ˈɡɑːr.dən.ɪŋ/', 'Làm vườn', '🌱'],
  ['sentences', '/ˈsen.təns.ɪz/', 'Câu nói', '💬'],
];

export const VOCAB: ReadonlyMap<string, VocabEntry> = new Map(ROWS.map(([en, ipa, vi, emoji]) => [en, { en, ipa, vi, emoji }]));
/** Số dòng khai báo (để test phát hiện từ khai báo trùng). */
export const VOCAB_ROWS = ROWS.length;

/** Câu ngắn (SPEC 15.3). Khóa = id ổn định. */
export const SENTENCES: Readonly<Record<string, SentenceEntry>> = {
  hello: { en: 'Hello!', vi: 'Xin chào!', emoji: '👋' },
  plantSeed: { en: "Let's plant a seed!", vi: 'Cùng gieo hạt nào!', emoji: '🌱' },
  waterFlowers: { en: 'Water the flowers!', vi: 'Tưới hoa nào!', emoji: '💧' },
  haveApple: { en: 'I have an apple!', vi: 'Mình có một quả táo!', emoji: '🍎' },
  makeCake: { en: "Let's make a cake!", vi: 'Cùng làm bánh kem nào!', emoji: '🎂' },
  zoo: { en: 'Welcome to Happy Zoo!', vi: 'Chào mừng đến Sở thú Vui vẻ!', emoji: '🦁' },
  care: { en: 'Animals need love and care.', vi: 'Con vật cần được yêu thương và chăm sóc.', emoji: '💚' },
};

/** Câu "I have a/an X!" cho các nông sản khác. */
export function haveSentence(word: string, emoji: string): SentenceEntry {
  if (word === 'apple') return SENTENCES.haveApple;
  const article = /^[aeiou]/.test(word) ? 'an' : 'a';
  return { en: `I have ${article} ${word}!`, vi: `Mình có ${VOCAB.get(word)?.vi.toLowerCase() ?? word}!`, emoji };
}

export function vocab(word: string): VocabEntry | undefined {
  return VOCAB.get(word.toLowerCase().trim());
}

/**
 * Tìm mục từ cho một chữ trong game: khớp chính xác, hoặc "X seeds" → X (mua hạt táo dạy APPLE — SPEC 15.3).
 */
export function resolveVocab(text: string): VocabEntry | undefined {
  const t = text.toLowerCase().replace(/[!?.]/g, '').trim();
  return vocab(t) ?? (t.endsWith(' seeds') ? vocab(t.slice(0, -6)) : undefined);
}

/** Các khóa câu chuẩn bắt buộc (dùng trong test). */
export const REQUIRED_SENTENCES = ['Hello!', "Let's plant a seed!", 'Water the flowers!', 'I have an apple!', "Let's make a cake!"];
