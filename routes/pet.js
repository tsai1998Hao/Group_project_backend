import express from "express";

const router = express.Router();

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from "#db-helpers/db-tool.js";

// 資料庫使用
import sequelize from "#configs/db.js";
const { Pet } = sequelize.models;
import { QueryTypes, Op } from "sequelize";

// 上傳檔案用使用multer
import multer from 'multer'

// multer的設定值 - START
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // 存放目錄
    callback(null, 'public/img/avatar/pet/')
  },
  filename: function (req, file, callback) {
    // // 經授權後，req.user帶有會員的id
    const newFilename = req.query.owner_id + '_' + req.query.pet_id + '_'
    // 新檔名由表單傳來的req.body.newFilename決定
    callback(null, newFilename + file.originalname)
    // callback(null, newFilename)
  },
})
const upload = multer({ storage: storage })
// multer的設定值 - END

// POST - 可同時上傳與更新寵物資料用，使用multer(設定值在此檔案最上面)
router.post(
  '/upload-avatar',
  upload.single('avatar'), // 上傳來的檔案(這是單個檔案，表單欄位名稱為avatar)
  async function (req, res) {
    // req.file 即上傳來的檔案(avatar這個檔案)
    // req.body 其它的文字欄位資料…
    // console.log(req.file, req.body)
    if (req.file) {
      const pet_id = req.query.pet_id
      const pet_avatar = req.file.filename

      try {
        // 對資料庫執行update
        const [affectedRows] = await Pet.update(
          { pet_avatar },
          {
            where: {
              pet_id,
            },
          }
        )

        // 沒有更新到任何資料 -> 失敗或沒有資料被更新
        if (!affectedRows) {
          return res.json({
            status: 'error',
            message: '更新失敗或沒有資料被更新',
          })
        }

        return res.json({
          status: 'success',
          data: { avatar: req.file.filename },
        })
      } catch (e) {
        console.log(e);

        return res.json({
          status: "error",
          message: "無法查詢到資料，查詢字串可能有誤",
        });
      }
    } else {
      return res.json({ status: 'fail', data: null })
    }
  }
)

// 獲得單筆資料
router.get("/list/:id", async (req, res, next) => {
  try {
  // 轉為數字
  const id = getIdParam(req);

    // 只會回傳單筆資料
    const pet = await Pet.findByPk(id, {
      raw: true, // 只需要資料表中資料
    });
    return res.json({ status: "success", data: { pet } });
  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法查詢到資料，查詢字串可能有誤",
    });
  }
});

// 獲得資料
router.get("/list/", async (req, res, next) => {
  // 獲取query參數值
  // const {
  //   page = 1, // number,  用於 OFFSET =  (Number(page) - 1) * Number(perpage),
  //   perpage = 10, // number, 用於 LIMIT
  //   owner_id = '', // string, 對應 sid 欄位,  `owner_id IN (sid)`
  //   raw=true, //boolean, 代表只回傳products陣列
  // } = req.query

  // !!注意: 以下都要檢查各query參數值的正確性，或給定預設值，要不然可能會產生資料庫查詢錯誤
  // 建立例如: `CONCAT(",", color, ",") REGEXP ",(1|2),"`
  const genConcatRegexp = (param, column) => {
    return sequelize.where(
      sequelize.fn("CONCAT", ",", sequelize.col(column), ","),
      {
        [Op.regexp]: `,(${param.split(",").join("|")}),`,
      }
    );
  };

  // 建立各where條件從句用
  const genClause = (key, value) => {
    switch (key) {
      case "owner_id":
        return {
          pet_owner_id: value.split(",").map((v) => Number(v)),
        };
      default:
        return "";
    }
  };

  // where各條件(以AND相連)
  const conditions = [];
  for (const [key, value] of Object.entries(req.query)) {
    if (value) {
      conditions.push(genClause(key, value));
    }
  }

  // console.log(conditions)

  // 分頁用
  const page = Number(req.query.page) || 1;
  const perpage = Number(req.query.perpage) || 9;
  const offset = (page - 1) * perpage;
  const limit = perpage;

  // 排序用
  const orderDirection = req.query.order || "ASC";
  const order = req.query.sort
    ? [[req.query.sort, orderDirection]]
    : [["pet_id", "ASC"]];

  // 避免sql查詢錯誤導致後端當掉，使用try/catch語句
  try {
    const { count, rows } = await Pet.findAndCountAll({
      where: { [Op.and]: conditions },
      raw: true, // 只需要資料表中資料,
      // logging: (msg) => console.log(msg.bgWhite),
      offset,
      limit,
      order,
    });

    if (req.query.raw === "true") {
      return res.json(rows);
    }

    // 計算總頁數
    const pageCount = Math.ceil(count / Number(perpage)) || 0;

    return res.json({
      status: "success",
      data: {
        total: count,
        pageCount,
        page,
        perpage,
        pets: rows,
      },
    });
  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法查詢到資料，查詢字串可能有誤",
    });
  }
});

// POST - 新增寵物資料
router.post("/add/", async function (req, res) {
  // req.body資料範例
  // {
  //     "owner_id":"1" //有會員登入管理後應該可移除
  //     "name":"金妮",
  //     "type":"狗",
  //     "breed":"黃金獵犬",
  //     "birthday":"2020/01/23",
  //     "chip_id":"215066148328030"
  //     "gender":"男"
  // }

  // 要新增的會員資料
  const newPet = req.body;

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (
    !newPet.pet_owner_id || //有會員登入管理後應該可移除
    !newPet.pet_name ||
    !newPet.pet_type ||
    !newPet.pet_breed ||
    !newPet.pet_birthday ||
    !newPet.pet_chip_id ||
    !newPet.pet_gender
  ) {
    return res.json({ status: "error", message: "缺少必要資料" });
  }

  // 執行後pet是建立的寵物資料，created為布林值
  // where指的是不可以有相同的資料，如username與email不能有相同的
  // defaults用於建立新資料用
  const created = await Pet.create({
    pet_owner_id: newPet.pet_owner_id,
    pet_name: newPet.pet_name,
    pet_type: newPet.pet_type,
    pet_breed: newPet.pet_breed,
    pet_birthday: newPet.pet_birthday,
    pet_chip_id: newPet.pet_chip_id,
    pet_gender: newPet.pet_gender,
    pet_avatar: 'default.jpg',
  });

  // 新增失敗 created=false 代表沒新增
  if (!created) {
    return res.json({ status: "error", message: "建立寵物失敗" });
  }

  // 成功建立寵物的回應
  // 狀態`201`是建立資料的標準回應，
  // 如有必要可以加上`Location`寵物建立的uri在回應標頭中，或是回應剛建立的資料
  // res.location(`/users/${user.id}`)
  return res.status(201).json({
    status: "success",
    data: {pet_id: created.dataValues.pet_id},
  });
});

// POST - 修改寵物資料
router.post("/edit/", async function (req, res) {
  // req.body資料範例
  // {
  //     "pet_id":"1",
  //     "pet_name":"金妮",
  //     "pet_type":"狗",
  //     "pet_breed":"黃金獵犬",
  //     "pet_birthday":"2020/01/23",
  //     "pet_chip_id":"215066148328030"
  //     "pet_gender":"公"
  // }

  // 要新增的會員資料
  const query = req.body;

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (
    !query.pet_id ||
    !query.pet_name ||
    !query.pet_type ||
    !query.pet_breed ||
    !query.pet_birthday ||
    !query.pet_chip_id ||
    !query.pet_gender
  ) {
    return res.json({ status: "error", message: "缺少必要資料" });
  }
  const pet_id = query.pet_id || 0;
  const pet_name = query.pet_name || '';
  const pet_type = query.pet_type || 0;
  const pet_breed = query.pet_breed || '';
  const pet_birthday = query.pet_birthday || 0;
  const pet_chip_id = query.pet_chip_id || '';
  const pet_gender = query.pet_gender || 0;

  try {
    // 執行後updated為布林值
    // where指的是不可以有相同的資料
    const updated = await Pet.update(
      { pet_name, pet_type, pet_breed, pet_birthday, pet_chip_id, pet_gender },
      {
        where: {
          pet_id: pet_id,
        },
      }
    );

    // 失敗 created=false 代表沒有修改
    if (!updated) {
      return res.json({ status: "error", message: "修改寵物資訊失敗" });
    }

    // 成功修改寵物的回應
    // 狀態`201`是建立資料的標準回應，
    return res.status(201).json({
      status: "success",
      data: null,
    });
  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法查詢到資料，查詢字串可能有誤",
    });
  }
});

// POST - 刪除寵物資料
router.post("/delete/", async function (req, res) {
  // req.body資料範例
  // {
  //     "pet_id":"1"
  // }

  // 要新增的會員資料
  const query = req.body;

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (
    !query.pet_id
  ) {
    return res.json({ status: "error", message: "缺少必要資料" });
  }

  try {
    // 執行後 deleted 為布林值
    // where指的是不可以有相同的資料
    const deleted = await Pet.destroy({
      where: {
        pet_id: query.pet_id,
      },
    });

    // 失敗 created=false 代表沒有刪除
    if (!deleted) {
      return res.json({ status: "error", message: "刪除寵物資訊失敗" });
    }

    // 成功刪除寵物的回應
    // 狀態`201`是建立資料的標準回應，
    return res.status(201).json({
      status: "success",
      data: null,
    });

  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法查詢到資料，查詢字串可能有誤",
    });
  }
});

export default router;