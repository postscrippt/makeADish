# Recipe batch 1 (draft for review, issue #22)

10 Thai dishes. Fields follow `mocks/recipes.ts`. **Nothing here is checked yet.** A Thai speaker must go through every dish before it is loaded.

How to review: for each dish, check the name, ingredients, quantities, steps, time, spice level and allergens. Mark anything wrong in the review box.

Not repeated from the mock data: ไข่เจียวหมูสับ, ไข่ตุ๋น, ผัดกะเพราหมู, ข้าวผัดไข่, ยำไข่ดาว, ผัดผักบุ้ง, ต้มจืดเต้าหู้, ต้มยำกุ้ง, แกงเขียวหวานไก่, หมูทอดกระเทียม.

Categories used: `stir-fry`, `soup`, `curry`, `salad`, `fried` (the current list). Spice is 0 to 3. Allergen tags follow the mock convention: fish sauce is `fish`, oyster sauce is `shellfish`, `soy` and `wheat`, soy sauce is `soy` and `wheat`, tofu is `soy`.

---

## 1. ต้มข่าไก่ (`tom-kha-kai`)

Chicken in coconut galangal soup. soup · spice 1 · 25 min · serves 2 · allergens: `fish`

| Ingredient | id | Amount |
|---|---|---|
| ไก่ | `chicken` | 200 กรัม |
| กะทิ | `coconut-milk` | 1 ถ้วย |
| ข่า | `galangal` | 5 แว่น |
| ตะไคร้ | `lemongrass` | 2 ต้น |
| ใบมะกรูด | `kaffir-lime-leaf` | 4 ใบ |
| เห็ด | `mushroom` | 100 กรัม |
| พริกขี้หนู | `chili` | 3 เม็ด |
| มะนาว | `lime` | ครึ่งลูก |
| น้ำปลา | `fish-sauce` | 1 1/2 ช้อนโต๊ะ |

1. ต้มน้ำ 1 ถ้วยกับกะทิ ข่า ตะไคร้ทุบ และใบมะกรูดให้เดือด
2. ใส่ไก่หั่นชิ้นพอดีคำ ต้มไฟกลางจนสุก
3. ใส่เห็ดและพริก ต้มต่ออีก 2 นาที
4. ปรุงรสด้วยน้ำปลา ปิดไฟ แล้วบีบมะนาว

Review: [ ] ok  Notes:

## 2. ส้มตำไทย (`som-tam-thai`)

Green papaya salad. salad · spice 3 · 10 min · serves 1 · allergens: `fish`, `shellfish`, `peanut`

| Ingredient | id | Amount |
|---|---|---|
| มะละกอดิบ | `green-papaya` | 1 ถ้วย (ซอยเส้น) |
| ถั่วฝักยาว | `long-bean` | 2 ฝัก |
| มะเขือเทศ | `tomato` | 3 ลูกเล็ก |
| กระเทียม | `garlic` | 2 กลีบ |
| พริกขี้หนู | `chili` | 2-5 เม็ด |
| กุ้งแห้ง | `dried-shrimp` | 1 ช้อนโต๊ะ |
| ถั่วลิสงคั่ว | `peanut` | 1 ช้อนโต๊ะ |
| น้ำตาลปี๊บ | `palm-sugar` | 1 ช้อนโต๊ะ |
| มะนาว | `lime` | 1 ลูก |
| น้ำปลา | `fish-sauce` | 1 1/2 ช้อนโต๊ะ |

1. โขลกกระเทียมกับพริกพอแหลก ใส่กุ้งแห้ง
2. ใส่น้ำตาลปี๊บ น้ำปลา น้ำมะนาว คนให้เข้ากัน
3. ใส่ถั่วฝักยาวและมะเขือเทศ โขลกเบา ๆ ให้ช้ำ
4. ใส่มะละกอ โขลกคลุกให้เข้ากัน โรยถั่วลิสง

Review: [ ] ok  Notes:

## 3. ผัดไทยกุ้งสด (`pad-thai-goong`)

Pad Thai with shrimp. stir-fry · spice 1 · 20 min · serves 1 · allergens: `shellfish`, `egg`, `soy`, `fish`, `peanut`

| Ingredient | id | Amount |
|---|---|---|
| เส้นจันท์ | `rice-noodle` | 100 กรัม (แช่น้ำให้นิ่ม) |
| กุ้ง | `shrimp` | 5 ตัว |
| ไข่ | `egg` | 1 ฟอง |
| เต้าหู้แข็ง | `tofu` | 30 กรัม |
| ถั่วงอก | `bean-sprout` | 1 กำมือ |
| กุยช่าย | `garlic-chive` | 3 ต้น |
| หอมแดง | `shallot` | 1 หัว |
| น้ำมะขามเปียก | `tamarind-paste` | 2 ช้อนโต๊ะ |
| น้ำปลา | `fish-sauce` | 1 ช้อนโต๊ะ |
| น้ำตาลปี๊บ | `palm-sugar` | 1 1/2 ช้อนโต๊ะ |
| ถั่วลิสงป่น | `peanut` | 1 ช้อนโต๊ะ |

1. ผสมน้ำมะขามเปียก น้ำปลา น้ำตาลปี๊บ ให้เป็นซอส
2. ผัดหอมแดงและเต้าหู้ในน้ำมันจนหอม ใส่กุ้งผัดจนสุก
3. ใส่เส้นกับซอส ผัดไฟกลางจนเส้นนุ่มและแห้งพอดี
4. ดันเส้นไปข้างหนึ่ง ตอกไข่ลงกระทะ รอให้ไข่เริ่มสุกแล้วผัดรวมกัน
5. ใส่ถั่วงอกและกุยช่าย ผัดเร็ว ๆ โรยถั่วลิสง

Review: [ ] ok  Notes:

## 4. ไข่พะโล้ (`khai-palo`)

Eggs and pork belly stewed in five-spice. soup · spice 0 · 45 min · serves 3 · allergens: `egg`, `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| ไข่ต้มสุก | `egg` | 4 ฟอง |
| หมูสามชั้น | `pork` | 200 กรัม |
| ผงพะโล้ | `five-spice` | 1/2 ช้อนชา |
| ซีอิ๊วขาว | `soy-sauce` | 2 ช้อนโต๊ะ |
| น้ำตาลปี๊บ | `palm-sugar` | 1 ช้อนโต๊ะ |
| กระเทียม | `garlic` | 3 กลีบ |

1. เจียวกระเทียมให้หอม ใส่หมูสามชั้นหั่นชิ้น ผัดจนเปลี่ยนสี
2. ใส่น้ำ 3 ถ้วย ผงพะโล้ ซีอิ๊วขาว และน้ำตาลปี๊บ ต้มให้เดือด
3. ลดไฟ ต้มประมาณ 30 นาทีจนหมูนุ่ม
4. ใส่ไข่ต้ม ต้มต่ออีก 10 นาทีให้ไข่เข้าสี

Review: [ ] ok  Notes:

## 5. ผัดซีอิ๊วหมู (`pad-see-ew-moo`)

Wide noodles stir-fried with pork and Chinese kale. stir-fry · spice 0 · 15 min · serves 1 · allergens: `egg`, `soy`, `wheat`, `shellfish`

| Ingredient | id | Amount |
|---|---|---|
| เส้นใหญ่ | `rice-noodle` | 150 กรัม |
| หมู | `pork` | 100 กรัม |
| คะน้า | `chinese-kale` | 100 กรัม |
| ไข่ | `egg` | 1 ฟอง |
| กระเทียม | `garlic` | 3 กลีบ |
| ซีอิ๊วขาว | `soy-sauce` | 1 ช้อนชา |
| ซีอิ๊วดำ | `dark-soy-sauce` | 1 ช้อนชา |
| ซอสหอยนางรม | `oyster-sauce` | 1 ช้อนโต๊ะ |
| น้ำตาลทราย | `sugar` | 1 ช้อนชา |

1. เจียวกระเทียมให้หอม ใส่หมูหั่นบาง ผัดจนสุก
2. ใส่เส้นใหญ่ ซีอิ๊วขาว ซีอิ๊วดำ ซอสหอยนางรม และน้ำตาล ผัดไฟแรงให้เส้นได้สีเข้มและติดกระทะเล็กน้อย
3. ดันเส้นไปข้างหนึ่ง ตอกไข่ลงไป ผัดให้เข้ากัน
4. ใส่คะน้า ผัดอีกประมาณ 1 นาที

Review: [ ] ok  Notes:

## 6. แกงจืดวุ้นเส้นหมูสับ (`kaeng-chuet-woon-sen`)

Clear soup with glass noodles and minced pork. soup · spice 0 · 20 min · serves 2 · allergens: `fish`, `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| วุ้นเส้น | `glass-noodle` | 40 กรัม (แช่น้ำให้นิ่ม) |
| หมูสับ | `pork` | 100 กรัม |
| เห็ด | `mushroom` | 3 ดอก |
| กระเทียม | `garlic` | 2 กลีบ |
| ต้นหอม | `spring-onion` | 2 ต้น |
| น้ำปลา | `fish-sauce` | 1 ช้อนโต๊ะ |
| ซีอิ๊วขาว | `soy-sauce` | 1 ช้อนชา |

1. ต้มน้ำ 3 ถ้วยกับกระเทียมทุบให้เดือด
2. ปั้นหมูสับเป็นก้อนเล็ก ๆ ใส่ลงไป รอให้สุก
3. ใส่เห็ดและวุ้นเส้น ต้ม 2-3 นาที
4. ปรุงรสด้วยน้ำปลาและซีอิ๊วขาว โรยต้นหอม

Review: [ ] ok  Notes:

## 7. ลาบหมู (`larb-moo`)

Spicy minced pork salad. salad · spice 3 · 20 min · serves 2 · allergens: `fish`

| Ingredient | id | Amount |
|---|---|---|
| หมูสับ | `pork` | 200 กรัม |
| หอมแดง | `shallot` | 3 หัว |
| พริกป่น | `chili-flakes` | 1 ช้อนชา |
| มะนาว | `lime` | 1 ลูก |
| น้ำปลา | `fish-sauce` | 1 1/2 ช้อนโต๊ะ |
| ข้าวคั่ว | `toasted-rice-powder` | 1 ช้อนโต๊ะ |
| สะระแหน่ | `mint` | 1 กำมือ |
| ต้นหอม | `spring-onion` | 2 ต้น |

1. ผัดหมูสับกับน้ำ 3 ช้อนโต๊ะ จนสุกทั่วและร่วน ตักพักให้อุ่น
2. ใส่หอมแดงซอย พริกป่น น้ำปลา และน้ำมะนาว คลุกให้เข้ากัน
3. ใส่ข้าวคั่ว ต้นหอม และสะระแหน่ คลุกเบา ๆ
4. เสิร์ฟกับผักสดและข้าวเหนียว

Review: [ ] ok  Notes:

## 8. ไก่ผัดเม็ดมะม่วงหิมพานต์ (`kai-pad-med-mamuang`)

Chicken stir-fried with cashews. stir-fry · spice 1 · 20 min · serves 2 · allergens: `tree_nut`, `shellfish`, `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| ไก่ | `chicken` | 200 กรัม |
| เม็ดมะม่วงหิมพานต์ | `cashew` | 1/3 ถ้วย |
| หอมใหญ่ | `onion` | ครึ่งหัว |
| พริกแห้ง | `dried-chili` | 4 เม็ด |
| กระเทียม | `garlic` | 3 กลีบ |
| ต้นหอม | `spring-onion` | 2 ต้น |
| ซอสหอยนางรม | `oyster-sauce` | 1 ช้อนโต๊ะ |
| ซีอิ๊วขาว | `soy-sauce` | 1 ช้อนโต๊ะ |
| น้ำตาลทราย | `sugar` | 1 ช้อนชา |

1. คั่วเม็ดมะม่วงในกระทะไฟอ่อนจนเหลือง ตักพักไว้
2. เจียวกระเทียมกับพริกแห้งให้หอม ใส่ไก่ ผัดจนสุก
3. ใส่หอมใหญ่ ซอสหอยนางรม ซีอิ๊วขาว และน้ำตาล ผัดให้เข้ากัน
4. ใส่เม็ดมะม่วงและต้นหอม ผัดเร็ว ๆ

Review: [ ] ok  Notes:

## 9. ผัดพริกแกงหมูถั่วฝักยาว (`pad-prik-gaeng-moo`)

Pork and long beans in red curry paste. stir-fry · spice 2 · 15 min · serves 1 · allergens: `shellfish`, `fish`

The `shellfish` tag is from the shrimp paste inside the red curry paste. Check the jar's label.

| Ingredient | id | Amount |
|---|---|---|
| หมู | `pork` | 150 กรัม |
| ถั่วฝักยาว | `long-bean` | 100 กรัม |
| พริกแกงเผ็ด | `red-curry-paste` | 1 1/2 ช้อนโต๊ะ |
| ใบมะกรูด | `kaffir-lime-leaf` | 3 ใบ |
| พริกขี้หนู | `chili` | 2 เม็ด |
| น้ำปลา | `fish-sauce` | 1 ช้อนโต๊ะ |
| น้ำตาลทราย | `sugar` | 1 ช้อนชา |

1. ผัดพริกแกงกับน้ำมันไฟกลางจนหอม
2. ใส่หมูหั่นบาง ผัดจนสุก
3. ใส่ถั่วฝักยาวหั่นท่อน ปรุงด้วยน้ำปลาและน้ำตาล ผัดประมาณ 2-3 นาที
4. ใส่ใบมะกรูดฉีกและพริก ผัดให้เข้ากัน

Review: [ ] ok  Notes:

## 10. ผัดฟักทองใส่ไข่ (`pad-fak-thong-khai`)

Pumpkin stir-fried with egg. stir-fry · spice 0 · 15 min · serves 2 · allergens: `egg`, `shellfish`, `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| ฟักทอง | `pumpkin` | 200 กรัม |
| ไข่ | `egg` | 2 ฟอง |
| กระเทียม | `garlic` | 3 กลีบ |
| ซอสหอยนางรม | `oyster-sauce` | 1 ช้อนโต๊ะ |

1. หั่นฟักทองเป็นชิ้นบาง ๆ
2. เจียวกระเทียมให้หอม ใส่ฟักทอง ผัดพร้อมน้ำเล็กน้อยจนนุ่ม
3. ปรุงด้วยซอสหอยนางรม
4. ตอกไข่ลงไป ผัดให้ไข่สุกและเข้ากัน

Review: [ ] ok  Notes:

---

## New ingredient ids to add (for #20)

These are not in `mocks/data.ts` yet. Thai name · English · aliases.

| id | ไทย | English | Aliases |
|---|---|---|---|
| `green-papaya` | มะละกอดิบ | green papaya | |
| `long-bean` | ถั่วฝักยาว | long bean | |
| `palm-sugar` | น้ำตาลปี๊บ | palm sugar | น้ำตาลมะพร้าว |
| `sugar` | น้ำตาลทราย | sugar | |
| `peanut` | ถั่วลิสง | peanut | ถั่วลิสงคั่ว, ถั่วลิสงป่น |
| `dried-shrimp` | กุ้งแห้ง | dried shrimp | |
| `bean-sprout` | ถั่วงอก | bean sprout | |
| `garlic-chive` | กุยช่าย | garlic chive | |
| `tamarind-paste` | น้ำมะขามเปียก | tamarind paste | มะขามเปียก |
| `soy-sauce` | ซีอิ๊วขาว | soy sauce | |
| `dark-soy-sauce` | ซีอิ๊วดำ | dark soy sauce | |
| `five-spice` | ผงพะโล้ | five-spice powder | |
| `mushroom` | เห็ด | mushroom | เห็ดฟาง, เห็ดนางรม |
| `chinese-kale` | คะน้า | Chinese kale | |
| `glass-noodle` | วุ้นเส้น | glass noodle | |
| `spring-onion` | ต้นหอม | spring onion | |
| `chili-flakes` | พริกป่น | chili flakes | |
| `toasted-rice-powder` | ข้าวคั่ว | toasted rice powder | |
| `mint` | สะระแหน่ | mint | |
| `cashew` | เม็ดมะม่วงหิมพานต์ | cashew | |
| `onion` | หอมใหญ่ | onion | |
| `dried-chili` | พริกแห้ง | dried chili | |
| `red-curry-paste` | พริกแกงเผ็ด | red curry paste | พริกแกงแดง |
| `pumpkin` | ฟักทอง | pumpkin | |

Also add the alias เส้นจันท์ to `rice-noodle` (used in dish 3).

## Things I am unsure about (please check)

- **Amounts and times** are typical home values, not tested in a kitchen. The pad Thai sauce ratio and the stewing time for ไข่พะโล้ are the ones I trust least.
- **Spice levels** are my guess: 0 none, 1 mild, 2 medium, 3 very hot. ส้มตำ and ลาบ depend on how many chilies the cook adds.
- **Allergen tags are a first pass,** not the rule map from #21.
  - ซีอิ๊วขาว as `soy` and `wheat`, and ซอสหอยนางรม as `shellfish`, `soy` and `wheat`, copy the mock convention.
  - กะทิ (coconut milk) is not tagged `tree_nut`. Decide whether it should be.
  - Bought pastes and sauces vary by brand. Dish 9's `shellfish` tag assumes shrimp paste in the red curry paste.
- **ลาบหมู:** the pork must be cooked through. I used the cooked version on purpose. Raw versions are not included.
- **Thai wording:** I wrote the Thai steps myself. They need a native reader for tone and word choice, especially สะระแหน่ vs ใบสะระแหน่ and the cooking verbs.
- **One kind of noodle:** `rice-noodle` covers both เส้นจันท์ (dish 3) and เส้นใหญ่ (dish 5). If you want them separate for matching, add `rice-noodle-wide`.
