<!--
 * @Author: 王野 18545455617@163.com
 * @Date: 2025-12-24 08:06:59
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-02-06 13:26:11
 * @FilePath: /vip/README.md
 * @Description: 项目文档
-->

# 项目文档

## 数据库部分

### 数据库设计

1. 数据库名称：qb

2. 数据库表设计
   - department 部门表
     存储部门层级结构(处级, 科级), 每个部门有一个上级部门, 根部门的上级部门 ID 为 NULL.

     |    字段名    |                 字段备注                  |        关联        |
     | :----------: | :---------------------------------------: | :----------------: |
     |      id      |             部门主键 ID(自增)             |         无         |
     |     name     |         部门名称(如 XX 处, XX 科)         |         无         |
     |  parent_id   |        上级部门 ID(根部门为 NULL)         | 关联 department.id |
     |    level     |      部门层级(1=处级/根部门, 2=科级)      |         无         |
     |     path     |   部门层级路径(如"1-3", 便于查询子部门)   |         无         |
     | created_time |          创建时间(默认当前时间)           |         无         |
     | updated_time |         更新时间(更新时自动刷新)          |         无         |
     | deleted_time | 软删除标记(NULL=未删除, 非 NULL=删除时间) |         无         |

   - auth 用户表
     存储用户信息(用户名, 密码, 角色)

     |    字段名    |                      字段备注                      | 关联 |
     | :----------: | :------------------------------------------------: | :--: |
     |      id      |                 用户主键 ID(自增)                  |  无  |
     |   username   |             登录用户名(唯一, 不可重复)             |  无  |
     |   password   |         加密密码(推荐 bcrypt/MD5 加密存储)         |  无  |
     |     role     | 用户角色(如 superadmin=超级管理员, user1=普通用户) |  无  |
     | created_time |               创建时间(默认当前时间)               |  无  |
     | updated_time |              更新时间(更新时自动刷新)              |  无  |
     | deleted_time |              软删除标记(NULL=未删除)               |  无  |

   - classify 分类表
     存储人员细分分类(如涉酒, 涉毒, 涉赌等)

     |    字段名    |            字段备注            | 关联 |
     | :----------: | :----------------------------: | :--: |
     |      id      |       分类主键 ID(自增)        |  无  |
     |     name     | 分类名称(如涉酒, 涉毒, 涉赌等) |  无  |
     | created_time |     创建时间(默认当前时间)     |  无  |
     | updated_time |    更新时间(更新时自动刷新)    |  无  |
     | deleted_time |    软删除标记(NULL=未删除)     |  无  |

   - tag 标签表
     存储人员标签信息(如涉酒, 涉毒, 涉赌等)

     |    字段名    |            字段备注            | 关联 |
     | :----------: | :----------------------------: | :--: |
     |      id      |       标签主键 ID(自增)        |  无  |
     |     name     | 标签名称(如涉酒, 涉毒, 涉赌等) |  无  |
     | created_time |     创建时间(默认当前时间)     |  无  |
     | updated_time |    更新时间(更新时自动刷新)    |  无  |
     | deleted_time |    软删除标记(NULL=未删除)     |  无  |

   - person 人员表
     存储人员核心信息(姓名, 性别, 证件, 联系方式等)

     |    字段名    |                                 字段备注                                 | 关联 |
     | :----------: | :----------------------------------------------------------------------: | :--: |
     |      id      |                            人员主键 ID(自增)                             |  无  |
     |     name     |                             人员姓名(如张三)                             |  无  |
     |    gender    |                             人员性别(男/女)                              |  无  |
     |  credential  |  证件(json 格式数组[{type: "二代身份证", value: "342622199201280611"}])  |  无  |
     |   contact    |     联系方式(json 格式数组[{type: "手机号", value: "18545455617"}])      |  无  |
     |   address    | 联系地址(json 格式数组[{type: "房屋地址", value: "浙江省杭州市西湖区"}]) |  无  |
     | created_time |                          创建时间(默认当前时间)                          |  无  |
     | updated_time |                         更新时间(更新时自动刷新)                         |  无  |
     | deleted_time |                         软删除标记(NULL=未删除)                          |  无  |

   - record 记录表
     存储 person 人员的事件记录(人员 ID, 事件类型, 事件时间, 事件描述)

     |    字段名    |         字段备注         | 关联 |
     | :----------: | :----------------------: | :--: |
     |      id      |    记录主键 ID(自增)     |  无  |
     |   content    |      事件内容(text)      |  无  |
     | created_time |  创建时间(默认当前时间)  |  无  |
     | updated_time | 更新时间(更新时自动刷新) |  无  |
     | deleted_time | 软删除标记(NULL=未删除)  |  无  |

   - auth2department 用户关联部门表
     存储用户与部门的关联关系(用户 ID, 部门 ID)

     |    字段名     |         字段备注         |        关联        |
     | :-----------: | :----------------------: | :----------------: |
     |    auth_id    |      用户 ID(外键)       |    关联 auth.id    |
     | department_id |      部门 ID(外键)       | 关联 department.id |
     | created_time  |  创建时间(默认当前时间)  |         无         |
     | updated_time  | 更新时间(更新时自动刷新) |         无         |
     | deleted_time  | 软删除标记(NULL=未删除)  |         无         |

   - auth2classify 用户关联分类表
     存储用户与分类的关联关系(用户 ID, 分类 ID)

     |    字段名    |         字段备注         |       关联       |
     | :----------: | :----------------------: | :--------------: |
     |   auth_id    |      用户 ID(外键)       |   关联 auth.id   |
     | classify_id  |      分类 ID(外键)       | 关联 classify.id |
     | created_time |  创建时间(默认当前时间)  |        无        |
     | updated_time | 更新时间(更新时自动刷新) |        无        |
     | deleted_time | 软删除标记(NULL=未删除)  |        无        |

   - auth2person 用户关联人员表
     存储用户与人员的关联关系(用户 ID, 人员 ID)

     |    字段名    |         字段备注         |      关联      |
     | :----------: | :----------------------: | :------------: |
     |   auth_id    |      用户 ID(外键)       |  关联 auth.id  |
     |  person_id   |      人员 ID(外键)       | 关联 person.id |
     | created_time |  创建时间(默认当前时间)  |       无       |
     | updated_time | 更新时间(更新时自动刷新) |       无       |
     | deleted_time | 软删除标记(NULL=未删除)  |       无       |

   - classify2person 人员关联分类表
     存储人员与分类的关联关系(人员 ID, 分类 ID)

     |    字段名    |         字段备注         |       关联       |
     | :----------: | :----------------------: | :--------------: |
     |  person_id   |      人员 ID(外键)       |  关联 person.id  |
     | classify_id  |      分类 ID(外键)       | 关联 classify.id |
     | created_time |  创建时间(默认当前时间)  |        无        |
     | updated_time | 更新时间(更新时自动刷新) |        无        |
     | deleted_time | 软删除标记(NULL=未删除)  |        无        |

   - person2record 人员关联记录表
     存储人员与记录的关联关系(人员 ID, 记录 ID)

     |    字段名    |         字段备注         |      关联      |
     | :----------: | :----------------------: | :------------: |
     |  person_id   |      人员 ID(外键)       | 关联 person.id |
     |  record_id   |      记录 ID(外键)       | 关联 record.id |
     | created_time |  创建时间(默认当前时间)  |       无       |
     | updated_time | 更新时间(更新时自动刷新) |       无       |
     | deleted_time | 软删除标记(NULL=未删除)  |       无       |

   - record2tag 记录关联标签表
     存储记录与标签的关联关系(记录 ID, 标签 ID)

     |    字段名    |         字段备注         |      关联      |
     | :----------: | :----------------------: | :------------: |
     |  record_id   |      记录 ID(外键)       | 关联 record.id |
     |    tag_id    |      标签 ID(外键)       |  关联 tag.id   |
     | created_time |  创建时间(默认当前时间)  |       无       |
     | updated_time | 更新时间(更新时自动刷新) |       无       |
     | deleted_time | 软删除标记(NULL=未删除)  |       无       |

3. 数据库语句
   -- 创建数据库
   CREATE DATABASE IF NOT EXISTS qb
   DEFAULT CHARACTER SET utf8mb4
   COLLATE utf8mb4_unicode_ci;

   USE qb;

   -- 1. 创建部门表(department)
   CREATE TABLE IF NOT EXISTS department (
   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '部门主键 ID',
   name VARCHAR(100) NOT NULL COMMENT '部门名称',
   parent_id INT UNSIGNED DEFAULT NULL COMMENT '上级部门 ID(根部门为 NULL)',
   level TINYINT UNSIGNED NOT NULL COMMENT '部门层级(1=处级/根部门, 2=科级)',
   path VARCHAR(255) NOT NULL COMMENT '部门层级路径(如"1-3")',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   FOREIGN KEY (parent_id) REFERENCES department(id) ON DELETE SET NULL,
   INDEX idx_parent_id (parent_id),
   INDEX idx_path (path)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

   -- 2. 创建用户表(auth)
   CREATE TABLE IF NOT EXISTS auth (
   id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY COMMENT '用户主键 ID',
   username VARCHAR(50) UNIQUE NOT NULL COMMENT '登录用户名',
   password VARCHAR(255) NOT NULL COMMENT '加密密码(推荐 bcrypt)',
   role JSON DEFAULT NULL COMMENT '用户角色',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   INDEX idx_username (username)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

   -- 3. 创建分类表(classify)
   CREATE TABLE IF NOT EXISTS classify (
   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分类主键 ID',
   name VARCHAR(50) NOT NULL COMMENT '分类名称',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   INDEX idx_name (name)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

   -- 4. 创建标签表(tag)
   CREATE TABLE IF NOT EXISTS tag (
   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '标签主键 ID',
   name VARCHAR(50) NOT NULL COMMENT '标签名称',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   INDEX idx_name (name)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';

   -- 5. 创建人员表(person)
   CREATE TABLE IF NOT EXISTS person (
   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '人员主键 ID',
   name VARCHAR(100) NOT NULL COMMENT '人员姓名',
   gender ENUM('男', '女') NOT NULL COMMENT '性别',
   birthday DATE COMMENT '出生日期',
   credential JSON COMMENT '证件信息(JSON 格式)',
   contact JSON COMMENT '联系方式(JSON 格式)',
   address JSON COMMENT '联系地址(JSON 格式)',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   INDEX idx_name (name)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员表';

   -- 6. 创建记录表(record)
   CREATE TABLE IF NOT EXISTS record (
   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录主键 ID',
   flag_inJQ ENUM('是', '否') NOT NULL DEFAULT '否' COMMENT '是否在警情中',
   content TEXT NOT NULL COMMENT '事件内容',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   FULLTEXT idx_content (content) COMMENT '全文索引(用于内容搜索)'
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='记录表';

   -- 7. 创建用户关联部门表(auth2department)
   CREATE TABLE IF NOT EXISTS auth2department (
   auth_id CHAR(36) NOT NULL COMMENT '用户 ID',
   department_id INT UNSIGNED NOT NULL COMMENT '部门 ID',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   FOREIGN KEY (auth_id) REFERENCES auth(id) ON DELETE CASCADE,
   FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE,
   UNIQUE KEY uk_auth_department (auth_id, department_id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户关联部门表';

   -- 8. 创建用户关联分类表(auth2classify)
   CREATE TABLE IF NOT EXISTS auth2classify (
   auth_id CHAR(36) NOT NULL COMMENT '用户 ID',
   classify_id INT UNSIGNED NOT NULL COMMENT '分类 ID',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   FOREIGN KEY (auth_id) REFERENCES auth(id) ON DELETE CASCADE,
   FOREIGN KEY (classify_id) REFERENCES classify(id) ON DELETE CASCADE,
   UNIQUE KEY uk_auth_classify (auth_id, classify_id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户关联分类表';

   -- 9. 创建用户关联人员表(auth2person)
   CREATE TABLE IF NOT EXISTS auth2person (
   auth_id CHAR(36) NOT NULL COMMENT '用户 ID',
   person_id INT UNSIGNED NOT NULL COMMENT '人员 ID',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   FOREIGN KEY (auth_id) REFERENCES auth(id) ON DELETE CASCADE,
   FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE,
   UNIQUE KEY uk_auth_person (auth_id, person_id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户关联人员表';

   -- 10. 创建人员关联分类表(classify2person)
   CREATE TABLE IF NOT EXISTS classify2person (
   person_id INT UNSIGNED NOT NULL COMMENT '人员 ID',
   classify_id INT UNSIGNED NOT NULL COMMENT '分类 ID',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE,
   FOREIGN KEY (classify_id) REFERENCES classify(id) ON DELETE CASCADE,
   UNIQUE KEY uk_person_classify (person_id, classify_id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员关联分类表';

   -- 11. 创建人员关联记录表(person2record)
   CREATE TABLE IF NOT EXISTS person2record (
   person_id INT UNSIGNED NOT NULL COMMENT '人员 ID',
   record_id INT UNSIGNED NOT NULL COMMENT '记录 ID',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE,
   FOREIGN KEY (record_id) REFERENCES record(id) ON DELETE CASCADE,
   UNIQUE KEY uk_person_record (person_id, record_id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员关联记录表';

   -- 12. 创建记录关联标签表(record2tag)
   CREATE TABLE IF NOT EXISTS record2tag (
   record_id INT UNSIGNED NOT NULL COMMENT '记录 ID',
   tag_id INT UNSIGNED NOT NULL COMMENT '标签 ID',
   created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   deleted_time TIMESTAMP NULL DEFAULT NULL COMMENT '软删除标记',
   FOREIGN KEY (record_id) REFERENCES record(id) ON DELETE CASCADE,
   FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE,
   UNIQUE KEY uk_record_tag (record_id, tag_id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='记录关联标签表';

   -- 插入部门数据(层级：1 管理员 →2 处级 →3 科级)
   INSERT INTO department (name, parent_id, level, path) VALUES
   ('关联超级管理员', NULL, 1, '1'),
   ('佳木斯铁路公安处', 1, 2, '1-2'),
   ('佳木斯站派出所', 2, 3, '1-2-3');

   -- 插入用户数据(密码使用 bcrypt 哈希示例, 实际应在应用层加密)
   INSERT INTO auth (username, password, role) VALUES
   ('025871', '$2b$10$misc5XXAW9mPpPTOfCo2i.XzB4s7VGeyX45ZsEYV1sJGLx8ZRki82', '["superadmin"]'),
   ('000001', '$2b$10$h9EkgDFZC.vLFZQEMUsC/eEoA.hdMDRPynsCcwfpZNVNt6sofma/i', '["user1"]'),
   ('000002', '$2b$10$h9EkgDFZC.vLFZQEMUsC/eEoA.hdMDRPynsCcwfpZNVNt6sofma/i', '["user2"]');

   -- 插入分类数据
   INSERT INTO classify (name) VALUES
   ('涉酒'),
   ('涉毒'),
   ('涉赌');

   -- 插入标签数据
   INSERT INTO tag (name) VALUES
   ('饮酒'),
   ('醉酒'),
   ('言语冲突');

   -- 插入人员数据
   INSERT INTO person (name, gender, birthday, credential, contact, address) VALUES
   ('张三', '男', '1990-01-01',
   '[{"type": "二代身份证", "value": "342622199001011111"}]',
   '[{"type": "手机号", "value": "13800138000"}]',
   '[{"type": "家庭地址", "value": "北京市海淀区"}]'),
   ('李四', '女', '1992-02-02',
   '[{"type": "护照", "value": "E12345678"}]',
   '[{"type": "邮箱", "value": "lisi@example.com"}]',
   '[{"type": "工作地址", "value": "上海市浦东新区"}]');

   -- 插入记录数据
   INSERT INTO record (content) VALUES
   ('2023年1月1日K554次列车上饮酒斗殴'),
   ('2023年1月2日佳木斯站出站口喊站揽客');

   -- 插入关联数据
   INSERT INTO auth2department (auth_id, department_id) VALUES
   ((SELECT id FROM auth WHERE username = '025871'), 1), -- 025871 关联超级管理员
   ((SELECT id FROM auth WHERE username = '000001'), 2), -- 000001 关联佳木斯铁路公安处
   ((SELECT id FROM auth WHERE username = '000002'), 3); -- 000002 关联佳木斯站派出所

   INSERT INTO auth2classify (auth_id, classify_id) VALUES
   ((SELECT id FROM auth WHERE username = '000001'), 1), -- 000001 管理涉酒分类
   ((SELECT id FROM auth WHERE username = '000002'), 2); -- 000002 管理涉毒分类

   INSERT INTO auth2person (auth_id, person_id) VALUES
   ((SELECT id FROM auth WHERE username = '000001'), 1), -- 000001 管理张三
   ((SELECT id FROM auth WHERE username = '000002'), 2); -- 000002 管理李四

   INSERT INTO classify2person (person_id, classify_id) VALUES
   (1, 1), -- 张三属于涉酒分类
   (2, 2); -- 李四属于涉毒分类

   INSERT INTO record2tag (record_id, tag_id) VALUES
   (1, 1), -- 记录 1 标记为饮酒
   (2, 2); -- 记录 2 标记为言语冲突

   INSERT INTO person2record (person_id, record_id) VALUES
   (1, 1), -- 张三关联记录 1
   (2, 2); -- 李四关联记录 2
