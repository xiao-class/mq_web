<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="设备编号" prop="equipmentNo">
        <el-input
          v-model="queryParams.equipmentNo"
          placeholder="请输入设备编号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备类型" prop="equipmentType">
        <el-select
          v-model="queryParams.equipmentType"
          placeholder="设备类型"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in dict.type.mqtt_equipment_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="启用" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="设备状态"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in dict.type.mqtt_equipment_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="onlineStatus">
        <el-select
          v-model="queryParams.onlineStatus"
          placeholder="是否在线"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in dict.type.mqtt_equipment_online"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="dataList">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" align="center" width="120"/>
      <el-table-column label="设备编号" prop="equipmentNo" align="center" :show-overflow-tooltip="true" width="240"/>
      <el-table-column label="启用" align="center" width="150">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="equipmentType" label="设备类型" align="center" width="180">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mqtt_equipment_type" :value="scope.row.equipmentType"/>
        </template>
      </el-table-column>
      <el-table-column prop="onlineStatus" label="状态" align="center" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mqtt_equipment_online" :value="scope.row.onlineStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" prop="createUserName" align="center" :show-overflow-tooltip="true" width="180"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="240">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.roleId !== 1">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改设备对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" :close-on-click-modal="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="equipmentNo">
              <el-input v-model="form.equipmentNo" placeholder="请输入设备编号" maxlength="20"
                        show-word-limit/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.mqtt_equipment_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="equipmentType">
              <el-select
                v-model="form.equipmentType"
                placeholder="设备类型"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="dict in dict.type.mqtt_equipment_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备绑定" prop="exchangeId">
              <el-select
                v-model="form.exchangeId"
                filterable
                placeholder="绑定"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="dict in exchangeList"
                  :key="dict.id"
                  :label="dict.exchangeName"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="设备作用" prop="equipmentEffect">
              <el-input v-model="form.equipmentEffect" type="text" placeholder="请输入内容" maxlength="30"
                        show-word-limit></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="设备位置" prop="equipmentPosition">
              <el-input v-model="form.equipmentPosition" type="text" placeholder="请输入内容" maxlength="30"
                        show-word-limit></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" maxlength="100"
                        show-word-limit></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {
  queryExchangeSelect,
  addEquipment,
  queryEquipmentLis,
  queryEquipmentById,
  editEquipment,
  editEquipmentStatus,
  delEquipment
} from "@/api/equipment/equipment";

export default {
  name: "ComponentsList",
  dicts: ['mqtt_equipment_status', 'mqtt_equipment_type', 'mqtt_equipment_online'],
  props: {
    status: {
      type: String,
      default: "1", //1已绑定 0未绑定
    },
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        equipmentNo: undefined,
        status: undefined,
        equipmentType: undefined,
        onlineStatus: undefined,
        bindingStatus: this.status
      },
      // 列表数据
      dataList: [],
      // 添加或修改交换机信息
      form: {},
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 交换机下拉列表
      exchangeList: [],
      // 校验规则
      rules: {
        equipmentNo: [
          {required: true, message: "设备编号不能为空", trigger: "blur"}
        ],
        equipmentType: [
          {required: true, message: "请选择设备类型", trigger: "blur"}
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        equipmentNo: undefined,
        equipmentEffect: undefined,
        equipmentPosition: undefined,
        exchangeId: undefined,
        status: "1",
        remark: undefined
      };
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 交换机状态修改
    handleStatusChange(row) {
      let text = row.status === "1" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.equipmentNo + '"设备吗？').then(function () {
        return editEquipmentStatus(row.roleId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /*新增设备*/
    handleAdd() {
      this.reset()
      this.queryExchangeList()
      this.title = "添加设备"
      this.open = true
    },
    /*获取设备列表*/
    getList() {
      this.loading = false
      queryEquipmentLis(this.queryParams).then(response => {
        this.dataList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      })
    },
    /*修改设备*/
    handleUpdate(row) {
      this.title = '修改设备信息'
      // 获取交换机下拉框
      this.queryExchangeList()
      // 获取详细信息
      queryEquipmentById(row.id).then(resp => {
        this.form = resp.data
        this.open = true
      })
    },
    /*删除设备*/
    handleDelete(row) {
      this.$modal.confirm('是否确认删除设备编号为"' + row.equipmentNo + '"的数据项？').then(function () {
        return delEquipment(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /*获取交换机下拉框列表*/
    queryExchangeList() {
      queryExchangeSelect().then(resp => {
        this.exchangeList = resp.data
      })
    },
    /*进行确定提交*/
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            // 说明为修改
            editEquipment(this.form).then(resp => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            })
          } else {
            // 说明为添加
            addEquipment(this.form).then(resp => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
