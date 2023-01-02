<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="交换机名称" prop="exchangeName">
        <el-input
          v-model="queryParams.exchangeName"
          placeholder="请输入交换机名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="交换机状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.mqtt_exchange_status"
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
      <el-table-column label="交换机名称" prop="exchangeName" align="center" :show-overflow-tooltip="true" width="240"/>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
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

    <!-- 添加或修改交换机对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="交换机名称" prop="exchangeName">
              <el-input v-model="form.exchangeName" placeholder="请输入交换机名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.mqtt_exchange_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
  exchangeList,
  exchangeEdit,
  exchangeAdd,
  getExchangeById,
  editExchangeStatus,
  delExchange
} from "@/api/exchange/exchange";

export default {
  name: "ExchangeIndex",
  dicts: ['mqtt_exchange_status'],
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
        exchangeName: undefined,
        status: undefined
      },
      // 列表数据
      dataList: [],
      // 添加或修改交换机信息
      form: {},
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 校验规则
      rules: {
        exchangeName: [
          {required: true, message: "交换机名称不能为空", trigger: "blur"}
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
        exchangeName: undefined,
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
    /** 查询设备数据列表 */
    getList() {
      this.loading = true;
      exchangeList(this.queryParams).then(response => {
        this.dataList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 交换机状态修改
    handleStatusChange(row) {
      let text = row.status === "1" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.exchangeName + '"交换机吗？').then(function () {
        return editExchangeStatus(row.roleId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /*添加按钮*/
    handleAdd() {
      this.reset()
      this.title = "添加交换机信息"
      this.open = true
    },
    /*修改*/
    handleUpdate(row) {
      getExchangeById(row.id).then(reps => {
        this.form = reps.data
        this.title = '修改交换机信息'
        this.open = true
      })
    },
    /*删除*/
    handleDelete(row) {
      this.$modal.confirm('是否确认删除交换机名称为"' + row.exchangeName + '"的数据项？').then(function () {
        return delExchange(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /*确定提交*/
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            // 说明为修改
            exchangeEdit(this.form).then(resp => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            })
          } else {
            // 说明为添加
            exchangeAdd(this.form).then(resp => {
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
