# Recipe batch 2 (draft for review, issue #22)

12 simple Thai dishes with only a few main ingredients each, so that typing two or three ingredients finds a match. Fields and format follow `batch-1.md`. **Nothing here is checked by a Thai speaker yet.** A Thai speaker must go through every dish before it is treated as final.

How to review: for each dish, check the name, ingredients, quantities, steps, time, spice level and allergens. Mark anything wrong in the review box.

Ingredients use only ids that already exist in `data/ingredients.ts`. Salt, sugar, pepper, cooking oil, fish sauce, soy sauce and oyster sauce are pantry staples (`data/staples.ts`): search assumes you have them, but they stay in the recipe and still count for allergens.

Categories used: `stir-fry`, `soup`, `curry`, `salad`, `fried`. Spice is 0 to 3.

---

## 1. ผัดผักรวม (`pad-pak-ruam`)

Mixed vegetable stir-fry. stir-fry · spice 0 · 10 min · serves 1 · allergens: `shellfish`, `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| กะหล่ำปลี | `cabbage` | 1 ถ้วย |
| แครอท | `carrot` | ครึ่งหัว |
| บรอกโคลี | `broccoli` | ครึ่งถ้วย |
| กระเทียม | `garlic` | 2 กลีบ |
| ซอสหอยนางรม | `oyster-sauce` | 1 ช้อนโต๊ะ |
| น้ำมันพืช | `cooking-oil` | 1 ช้อนโต๊ะ |

1. ตั้งกระทะ ใส่น้ำมัน เจียวกระเทียมให้หอม
2. ใส่แครอทและบรอกโคลี ผัดไฟแรง 1 นาที
3. ใส่กะหล่ำปลี ปรุงด้วยซอสหอยนางรม
4. ผัดต่ออีก 1 นาทีให้ผักยังกรอบ แล้วตักเสิร์ฟ

Review: [ ] ok  Notes:

## 2. ผัดคะน้าหมู (`pad-kana-moo`)

Stir-fried Chinese kale with pork. stir-fry · spice 1 · 12 min · serves 1 · allergens: `shellfish`, `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| หมู | `pork` | 100 กรัม |
| คะน้า | `chinese-kale` | 1 กำมือ |
| กระเทียม | `garlic` | 3 กลีบ |
| พริกขี้หนู | `chili` | 2 เม็ด |
| ซอสหอยนางรม | `oyster-sauce` | 1 ช้อนโต๊ะ |
| น้ำตาลทราย | `sugar` | ครึ่งช้อนชา |
| น้ำมันพืช | `cooking-oil` | 1 ช้อนโต๊ะ |

1. โขลกกระเทียมกับพริกพอแหลก
2. ผัดพริกกระเทียมกับน้ำมันจนหอม
3. ใส่หมู ผัดจนสุก
4. ใส่คะน้า ปรุงด้วยซอสหอยนางรมและน้ำตาล
5. ผัดไฟแรงให้คะน้ายังเขียวสด แล้วปิดไฟ

Review: [ ] ok  Notes:

## 3. ข้าวต้มหมู (`khao-tom-moo`)

Rice soup with pork meatballs. soup · spice 0 · 25 min · serves 2 · allergens:

| Ingredient | id | Amount |
|---|---|---|
| ข้าวสวย | `rice` | 2 ถ้วย |
| หมูสับ | `pork` | 100 กรัม |
| ขิง | `ginger` | 3 แว่น |
| ต้นหอม | `spring-onion` | 2 ต้น |
| ขึ้นฉ่าย | `celery` | 1 ต้น |
| เกลือ | `salt` | ครึ่งช้อนชา |
| พริกไทย | `pepper` | 1/4 ช้อนชา |

1. ต้มน้ำ 4 ถ้วยกับขิงให้เดือด
2. ปั้นหมูสับเป็นก้อนเล็ก ๆ ใส่ลงไป ต้มจนสุก
3. ใส่ข้าวสวย ลดไฟ ต้มต่ออีก 10 นาที
4. ปรุงรสด้วยเกลือและพริกไทย
5. โรยต้นหอมและขึ้นฉ่าย

Review: [ ] ok  Notes:

## 4. ต้มจืดผักกาดขาวหมูสับ (`tom-jued-pak-kad-khao`)

Clear soup with napa cabbage and minced pork. soup · spice 0 · 20 min · serves 2 · allergens: `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| ผักกาดขาว | `napa-cabbage` | 2 ถ้วย |
| หมูสับ | `pork` | 100 กรัม |
| ต้นหอม | `spring-onion` | 1 ต้น |
| ซีอิ๊วขาว | `soy-sauce` | 1 ช้อนโต๊ะ |
| พริกไทย | `pepper` | 1/4 ช้อนชา |

1. ต้มน้ำ 3 ถ้วยให้เดือด
2. ปั้นหมูสับเป็นก้อนเล็ก ๆ ใส่ลงไป ต้มจนสุก
3. ใส่ผักกาดขาว ต้มต่ออีก 3 นาที
4. ปรุงรสด้วยซีอิ๊วขาวและพริกไทย
5. ใส่ต้นหอม แล้วปิดไฟ

Review: [ ] ok  Notes:

## 5. ไก่ทอดกระเทียมพริกไทย (`kai-tod-kratiam`)

Fried chicken with garlic and pepper. fried · spice 0 · 25 min · serves 2 · allergens: `fish`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| ไก่ | `chicken` | 300 กรัม (หั่นชิ้นพอดีคำ) |
| กระเทียม | `garlic` | 5 กลีบ |
| ผักชี | `coriander` | 1 ต้น (รากและโคน) |
| พริกไทย | `pepper` | 1 ช้อนชา |
| น้ำปลา | `fish-sauce` | 1 ช้อนโต๊ะ |
| แป้งสาลี | `flour` | 2 ช้อนโต๊ะ |
| น้ำมันพืช | `cooking-oil` | 1 ถ้วย (สำหรับทอด) |

1. โขลกกระเทียม พริกไทย และรากผักชีให้ละเอียด
2. หมักไก่กับเครื่องที่โขลกและน้ำปลาทิ้งไว้ 15 นาที
3. คลุกแป้งสาลีให้ทั่วชิ้นไก่
4. ตั้งน้ำมันไฟกลาง ทอดไก่ประมาณ 10 นาทีจนสุกเหลือง
5. ตักขึ้นสะเด็ดน้ำมัน

Review: [ ] ok  Notes:

## 6. ผัดมะเขือยาวหมูสับ (`pad-makuea-yao-moo`)

Stir-fried long eggplant with minced pork and basil. stir-fry · spice 2 · 15 min · serves 1 · allergens: `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| มะเขือยาว | `eggplant` | 1 ผล (หั่นท่อน) |
| หมูสับ | `pork` | 100 กรัม |
| กระเทียม | `garlic` | 3 กลีบ |
| พริกขี้หนู | `chili` | 3 เม็ด |
| ใบกะเพรา | `holy-basil` | 1 กำมือ |
| เต้าเจี้ยว | `bean-paste` | 1 ช้อนโต๊ะ |
| น้ำตาลทราย | `sugar` | ครึ่งช้อนชา |
| น้ำมันพืช | `cooking-oil` | 1 ช้อนโต๊ะ |

1. โขลกกระเทียมกับพริกพอแหลก
2. ผัดพริกกระเทียมกับน้ำมันจนหอม ใส่หมูสับ ผัดจนสุก
3. ใส่มะเขือยาว เติมน้ำ 3 ช้อนโต๊ะ ผัดจนนิ่ม
4. ปรุงด้วยเต้าเจี้ยวและน้ำตาล
5. ใส่ใบกะเพรา ผัดเร็ว ๆ แล้วปิดไฟ

Review: [ ] ok  Notes:

## 7. ข้าวผัดหมู (`khao-pad-moo`)

Pork fried rice. stir-fry · spice 0 · 15 min · serves 1 · allergens: `egg`, `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| ข้าวสวย | `rice` | 1 ถ้วย |
| หมูสับ | `pork` | 80 กรัม |
| ไข่ | `egg` | 1 ฟอง |
| กระเทียม | `garlic` | 2 กลีบ |
| มะเขือเทศ | `tomato` | ครึ่งลูก |
| ต้นหอม | `spring-onion` | 1 ต้น |
| ซีอิ๊วขาว | `soy-sauce` | 1 ช้อนชา |
| น้ำมันพืช | `cooking-oil` | 1 ช้อนโต๊ะ |

1. เจียวกระเทียมกับน้ำมันให้หอม
2. ใส่หมูสับ ผัดจนสุก
3. ตอกไข่ลงไป ยีให้แตก
4. ใส่ข้าว ผัดให้เข้ากัน ปรุงด้วยซีอิ๊วขาว
5. ใส่มะเขือเทศและต้นหอม ผัดอีกครั้งแล้วปิดไฟ

Review: [ ] ok  Notes:

## 8. ไข่ลูกเขย (`khai-luk-khoei`)

Fried boiled eggs with tamarind sauce. fried · spice 1 · 20 min · serves 2 · allergens: `egg`, `fish`

| Ingredient | id | Amount |
|---|---|---|
| ไข่ | `egg` | 3 ฟอง |
| หอมแดง | `shallot` | 3 หัว (ซอย) |
| น้ำมะขามเปียก | `tamarind-paste` | 2 ช้อนโต๊ะ |
| น้ำตาลปี๊บ | `palm-sugar` | 2 ช้อนโต๊ะ |
| น้ำปลา | `fish-sauce` | 1 ช้อนโต๊ะ |
| พริกแห้ง | `dried-chili` | 2 เม็ด |
| น้ำมันพืช | `cooking-oil` | 1 ถ้วย (สำหรับทอด) |

1. ต้มไข่ในน้ำเดือด 8 นาทีจนสุก แกะเปลือก
2. ทอดไข่ในน้ำมันร้อนจนผิวเหลืองกรอบ ตักพักไว้
3. ทอดหอมแดงกับพริกแห้งจนกรอบ ตักพักไว้
4. เคี่ยวน้ำมะขามเปียก น้ำตาลปี๊บ และน้ำปลาด้วยไฟอ่อนจนข้นเล็กน้อย
5. ราดน้ำมะขามบนไข่ โรยหอมแดงและพริกทอด

Review: [ ] ok  Notes:

## 9. ยำวุ้นเส้นกุ้ง (`yam-woon-sen-goong`)

Glass noodle salad with shrimp. salad · spice 3 · 15 min · serves 1 · allergens: `fish`, `shellfish`

| Ingredient | id | Amount |
|---|---|---|
| วุ้นเส้น | `glass-noodle` | 50 กรัม |
| กุ้ง | `shrimp` | 5 ตัว |
| มะเขือเทศ | `tomato` | ครึ่งลูก |
| ขึ้นฉ่าย | `celery` | 1 ต้น |
| หอมแดง | `shallot` | 2 หัว |
| มะนาว | `lime` | 1 ลูก |
| พริกขี้หนู | `chili` | 3 เม็ด |
| น้ำปลา | `fish-sauce` | 1 1/2 ช้อนโต๊ะ |
| น้ำตาลทราย | `sugar` | 1 ช้อนชา |

1. แช่วุ้นเส้นในน้ำร้อน 5 นาที สะเด็ดน้ำ ตัดให้สั้น
2. ลวกกุ้งในน้ำเดือดจนสุก
3. ผสมน้ำปลา น้ำมะนาว น้ำตาล และพริกซอย คนให้น้ำตาลละลาย
4. ใส่วุ้นเส้น กุ้ง หอมแดง มะเขือเทศ และขึ้นฉ่าย คลุกเบา ๆ

Review: [ ] ok  Notes:

## 10. ผัดเปรี้ยวหวานไก่ (`pad-prio-wan-kai`)

Sweet and sour chicken stir-fry. stir-fry · spice 0 · 15 min · serves 2 · allergens:

| Ingredient | id | Amount |
|---|---|---|
| ไก่ | `chicken` | 200 กรัม |
| สับปะรด | `pineapple` | ครึ่งถ้วย |
| มะเขือเทศ | `tomato` | 1 ลูก |
| แตงกวา | `cucumber` | ครึ่งลูก |
| หอมใหญ่ | `onion` | ครึ่งหัว |
| ซอสมะเขือเทศ | `ketchup` | 3 ช้อนโต๊ะ |
| น้ำตาลทราย | `sugar` | 1 ช้อนชา |
| น้ำมันพืช | `cooking-oil` | 1 ช้อนโต๊ะ |

1. ผัดไก่กับน้ำมันจนสุก
2. ใส่หอมใหญ่ ผัดจนนิ่ม
3. ใส่ซอสมะเขือเทศและน้ำตาล ผัดให้เข้ากัน
4. ใส่สับปะรด มะเขือเทศ และแตงกวา ผัดเร็ว ๆ ประมาณ 1 นาที แล้วปิดไฟ

Review: [ ] ok  Notes:

## 11. ผัดถั่วงอกเต้าหู้ (`pad-tua-ngok-tao-hoo`)

Stir-fried bean sprouts with tofu. stir-fry · spice 0 · 10 min · serves 1 · allergens: `soy`, `wheat`

| Ingredient | id | Amount |
|---|---|---|
| ถั่วงอก | `bean-sprout` | 1 ถ้วย |
| เต้าหู้แข็ง | `tofu` | ครึ่งก้อน (หั่นลูกเต๋า) |
| กุยช่าย | `garlic-chive` | 1 กำมือ (หั่นท่อน) |
| กระเทียม | `garlic` | 2 กลีบ |
| ซีอิ๊วขาว | `soy-sauce` | 1 ช้อนโต๊ะ |
| น้ำมันพืช | `cooking-oil` | 1 ช้อนโต๊ะ |

1. ตั้งกระทะ ใส่น้ำมัน เจียวกระเทียมให้หอม
2. ใส่เต้าหู้ ผัดจนเหลืองเล็กน้อย
3. ใส่ถั่วงอกและกุยช่าย ปรุงด้วยซีอิ๊วขาว
4. ผัดไฟแรง 1 นาที แล้วปิดไฟ

Review: [ ] ok  Notes:

## 12. ต้มยำไก่น้ำใส (`tom-yum-kai-nam-sai`)

Clear spicy and sour chicken soup. soup · spice 3 · 25 min · serves 2 · allergens: `fish`

| Ingredient | id | Amount |
|---|---|---|
| ไก่ | `chicken` | 200 กรัม |
| เห็ด | `mushroom` | 100 กรัม |
| ตะไคร้ | `lemongrass` | 2 ต้น |
| ข่า | `galangal` | 5 แว่น |
| ใบมะกรูด | `kaffir-lime-leaf` | 4 ใบ |
| พริกขี้หนู | `chili` | 5 เม็ด |
| มะนาว | `lime` | 1 ลูก |
| น้ำปลา | `fish-sauce` | 2 ช้อนโต๊ะ |

1. ต้มน้ำ 3 ถ้วยกับข่า ตะไคร้ทุบ และใบมะกรูดให้เดือด
2. ใส่ไก่ ต้มไฟกลางจนสุก
3. ใส่เห็ดและพริกทุบ ต้มต่ออีก 2 นาที
4. ปรุงรสด้วยน้ำปลา ปิดไฟ แล้วบีบมะนาว
