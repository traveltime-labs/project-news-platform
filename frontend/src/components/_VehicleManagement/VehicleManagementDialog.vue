<script setup lang="ts">
import AppDialog from '@/components/AppDialog.vue'
import { Button } from '@/components/ui/button'
import { computed, ref, watch } from 'vue'

// validation libs – make sure you have installed these packages
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toFormValidator } from '@vee-validate/zod'
import * as z from 'zod'
import type { VehicleItem } from '@/assets/apis/vehicles'

const props = withDefaults(defineProps<{
  open?: boolean
  mode?: 'create' | 'edit'
  initialData?: Partial<VehicleItem> | null
  showTrigger?: boolean
}>(), {
  mode: 'create',
  showTrigger: true,
  initialData: null,
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved', value: VehicleItem): void
}>()

const isDialogOpen = ref(false)

// zod schema describing the shape of fakeCreateForm
const vehicleSchema = z.object({
  vehicleType: z.enum(['Car', 'Motorcycle']),
  licensePlate: z.string().min(1, '請輸入車牌'),
  brand: z.string().min(1, '請輸入品牌'),
  modelName: z.string().min(1, '請輸入車型'),
  manufactureDate: z.string().optional(),
  vinNumber: z.string()
    .refine(v => !v || v.length === 17, { message: 'VIN 車身號碼需為 17 碼' })
    .optional(),
  engineNumber: z.string()
    .refine(v => !v || (v.length >= 6 && v.length <= 20), { message: '引擎／馬達號碼需介於 6–20 個字元' })
    .optional(),
  energyType: z.string().min(1),
  displacement: z.string().optional(),
  driveType: z.string().optional(),
  color: z.string().optional(),
  seatingCapacity: z.coerce.number().nullable().optional(),
  plateColor: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseAmount: z.coerce.number().nonnegative().optional(),
  acquisitionMethod: z.string().optional(),
  vendor: z.string().optional(),
  currentMileage: z.coerce.number().nonnegative().optional(),
  insuranceExpiry: z.string().optional(),
  nextInspectionDate: z.string().optional(),
  custodian: z.string().optional(),
  department: z.string().optional(),
});


const fakeCreateForm: z.infer<typeof vehicleSchema> = {
  // 核心識別
  vehicleType: 'Car', // 'Car' | 'Motorcycle'
  licensePlate: '',   // 車牌號碼
  brand: '',          // 車輛品牌
  modelName: '',      // 車型名稱
  manufactureDate: '', // 出廠年月 (YYYY-MM)
  vinNumber: '',      // 車身號碼 (17碼)
  engineNumber: '',   // 引擎號碼

  // 規格細節
  energyType: 'Gasoline', // 汽油, 柴油, 純電(BEV), 油電(HEV), 換電(Electric-Swap)
  displacement: '',       // 排氣量 (單位: cc)
  driveType: '',          // 傳動方式 (前驅, 後驅, 四輪傳動)
  color: '',              // 顏色
  seatingCapacity: null,  // 座位數 (機車通常為 2)
  plateColor: 'White',    // 牌照顏色 (機車適用: 綠, 白, 黃, 紅)

  // 財務與來源
  purchaseDate: '',       // 購入日期 (YYYY-MM-DD)
  purchaseAmount: 0,      // 購入金額
  acquisitionMethod: '',  // 取得方式 (新購, 租賃, 二手)
  vendor: '',             // 供應商/經銷商

  // 營運管理 (預留欄位)
  currentMileage: 0,      // 目前里程數
  insuranceExpiry: '',    // 保險到期日
  nextInspectionDate: '', // 下次驗車/排檢日
  custodian: '',          // 保管人/司機
  department: ''          // 所屬部門
};

const dialogTitle = computed(() => (props.mode === 'edit' ? '編輯車輛資料' : '新增汽機車資料'))

const mergedInitialValues = computed(() => {
  return {
    ...fakeCreateForm,
    ...(props.initialData ?? {}),
  }
})


// 初始化表單值
// useForm hook with zod validation and vee-validate
const { resetForm, validate, values } = useForm({
  validationSchema: toFormValidator(vehicleSchema),
  initialValues: mergedInitialValues.value,
});

watch(
  () => props.open,
  (value) => {
    if (value !== undefined) {
      isDialogOpen.value = value
    }
  },
  { immediate: true },
)

watch(isDialogOpen, (value) => {
  emit('update:open', value)
  if (value) {
    resetForm({ values: mergedInitialValues.value })
  }
})

watch(
  () => props.initialData,
  () => {
    if (isDialogOpen.value) {
      resetForm({ values: mergedInitialValues.value })
    }
  },
  { deep: true },
)

const closeDialog = () => {
  isDialogOpen.value = false
}

const onSubmit = async () => {
  const { valid } = await validate()
  if (!valid) {
    alert('表單驗證未通過，請先修正紅字欄位後再送出。')
    return
  }
  emit('saved', { ...values } as VehicleItem)
  closeDialog()
}



</script>
<template>
  <AppDialog v-model:open="isDialogOpen">
    <template v-if="showTrigger" #trigger>
      <Button class="bg-primary text-primary-foreground hover:bg-primary/90">新增車輛</Button>
    </template>

    <template #title>
      <span class="text-foreground">
        {{ dialogTitle }}
      </span>
    </template>

    <template #content>
      <!-- 使用 vee-validate 的 Form 與 Field 組件 -->
      <form class="flex flex-col gap-0" id="vehicle-management-form">
        <div class="space-y-5 overflow-y-auto max-h-[60vh] pr-1 pb-1">

        <!-- ── 基本識別 ── -->
        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">基本識別</p>

        <!-- 車輛類型 -->
        <div class="grid gap-1">
          <label for="vehicleType" class="text-sm font-medium text-foreground">車輛類型</label>
          <Field id="vehicleType" name="vehicleType" as="select"
            class="w-full rounded-md border border-input bg-background p-2 text-foreground"
          >
            <option value="Car">🚗 汽車</option>
            <option value="Motorcycle">🛵 機車</option>
          </Field>
          <ErrorMessage name="vehicleType" class="text-red-500 text-xs" />
        </div>

        <!-- 車牌號碼 -->
        <div class="grid gap-1">
          <label for="licensePlate" class="text-sm font-medium text-foreground">車牌號碼 <span class="text-red-500">*</span></label>
          <Field id="licensePlate" name="licensePlate" as="input"
            class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
            placeholder="例：ABC-1234"
          />
          <ErrorMessage name="licensePlate" class="text-red-500 text-xs" />
        </div>

        <!-- 品牌 / 車型 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1">
            <label for="brand" class="text-sm font-medium text-foreground">品牌 <span class="text-red-500">*</span></label>
            <Field id="brand" name="brand" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="例：Toyota"
            />
            <ErrorMessage name="brand" class="text-red-500 text-xs" />
          </div>
          <div class="grid gap-1">
            <label for="modelName" class="text-sm font-medium text-foreground">車型 <span class="text-red-500">*</span></label>
            <Field id="modelName" name="modelName" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="例：RAV4"
            />
            <ErrorMessage name="modelName" class="text-red-500 text-xs" />
          </div>
        </div>

        <!-- 出廠年月 -->
        <div class="grid gap-1">
          <label for="manufactureDate" class="text-sm font-medium text-foreground">出廠年月</label>
          <Field id="manufactureDate" name="manufactureDate" as="input" type="month"
            class="w-full rounded-md border border-input bg-background p-2 text-foreground"
          />
        </div>

        <!-- VIN / 引擎號碼 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1">
            <label for="vinNumber" class="text-sm font-medium text-foreground">車身號碼 (VIN)</label>
            <Field id="vinNumber" name="vinNumber" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="17碼"
            />
            <ErrorMessage name="vinNumber" class="text-red-500 text-xs" />
          </div>
          <div class="grid gap-1">
            <label for="engineNumber" class="text-sm font-medium text-foreground">引擎 / 馬達號碼</label>
            <Field id="engineNumber" name="engineNumber" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
            />
            <ErrorMessage name="engineNumber" class="text-red-500 text-xs" />
          </div>
        </div>

        <!-- ── 規格細節 ── -->
        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1 pt-2">規格細節</p>

        <!-- 能源類型 -->
        <div class="grid gap-1">
          <label for="energyType" class="text-sm font-medium text-foreground">能源類型 <span class="text-red-500">*</span></label>
          <Field id="energyType" name="energyType" as="select"
            class="w-full rounded-md border border-input bg-background p-2 text-foreground"
          >
            <option value="Gasoline">汽油</option>
            <option value="Diesel">柴油</option>
            <option value="HEV">油電混合 (HEV)</option>
            <option value="PHEV">插電混合 (PHEV)</option>
            <option value="BEV">純電 (BEV)</option>
            <option value="Electric-Swap">換電式電動</option>
          </Field>
          <ErrorMessage name="energyType" class="text-red-500 text-xs" />
        </div>

        <!-- 排氣量 / 傳動方式 / 顏色 / 座位數 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1">
            <label for="displacement" class="text-sm font-medium text-foreground">排氣量</label>
            <Field id="displacement" name="displacement" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="例：2487 cc"
            />
          </div>
          <div class="grid gap-1">
            <label for="driveType" class="text-sm font-medium text-foreground">傳動方式</label>
            <Field id="driveType" name="driveType" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="例：AWD、皮帶傳動"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1">
            <label for="color" class="text-sm font-medium text-foreground">顏色</label>
            <Field id="color" name="color" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="例：極光銀"
            />
          </div>
          <div class="grid gap-1">
            <label for="seatingCapacity" class="text-sm font-medium text-foreground">座位數</label>
            <Field id="seatingCapacity" name="seatingCapacity" as="input" type="number" min="1"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground"
              placeholder="例：5"
            />
          </div>
        </div>

        <!-- 牌照顏色（機車適用） -->
        <div class="grid gap-1">
          <label for="plateColor" class="text-sm font-medium text-foreground">牌照顏色（機車適用）</label>
          <Field id="plateColor" name="plateColor" as="select"
            class="w-full rounded-md border border-input bg-background p-2 text-foreground"
          >
            <option value="">— 不適用 —</option>
            <option value="White">白牌（150cc 以下）</option>
            <option value="Yellow">黃牌（151–250cc）</option>
            <option value="Red">紅牌（251cc 以上）</option>
            <option value="Green">綠牌（電動）</option>
          </Field>
        </div>

        <!-- ── 財務與來源 ── -->
        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1 pt-2">財務與來源</p>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1">
            <label for="purchaseDate" class="text-sm font-medium text-foreground">購入日期</label>
            <Field id="purchaseDate" name="purchaseDate" as="input" type="date"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground"
            />
          </div>
          <div class="grid gap-1">
            <label for="purchaseAmount" class="text-sm font-medium text-foreground">購入金額（元）</label>
            <Field id="purchaseAmount" name="purchaseAmount" as="input" type="number" min="0"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground"
              placeholder="例：1250000"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1">
            <label for="acquisitionMethod" class="text-sm font-medium text-foreground">取得方式</label>
            <Field id="acquisitionMethod" name="acquisitionMethod" as="select"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground"
            >
              <option value="">— 請選擇 —</option>
              <option value="新購">新購</option>
              <option value="二手">二手</option>
              <option value="租賃">租賃</option>
              <option value="其他">其他</option>
            </Field>
          </div>
          <div class="grid gap-1">
            <label for="vendor" class="text-sm font-medium text-foreground">供應商 / 經銷商</label>
            <Field id="vendor" name="vendor" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="例：國都汽車"
            />
          </div>
        </div>

        <!-- ── 營運管理 ── -->
        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1 pt-2">營運管理</p>

        <div class="grid gap-1">
          <label for="currentMileage" class="text-sm font-medium text-foreground">目前里程數（km）</label>
          <Field id="currentMileage" name="currentMileage" as="input" type="number" min="0"
            class="w-full rounded-md border border-input bg-background p-2 text-foreground"
            placeholder="例：8500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1">
            <label for="insuranceExpiry" class="text-sm font-medium text-foreground">保險到期日</label>
            <Field id="insuranceExpiry" name="insuranceExpiry" as="input" type="date"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground"
            />
          </div>
          <div class="grid gap-1">
            <label for="nextInspectionDate" class="text-sm font-medium text-foreground">下次驗車 / 排檢日</label>
            <Field id="nextInspectionDate" name="nextInspectionDate" as="input" type="date"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1">
            <label for="custodian" class="text-sm font-medium text-foreground">保管人 / 司機</label>
            <Field id="custodian" name="custodian" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="例：張小明"
            />
          </div>
          <div class="grid gap-1">
            <label for="department" class="text-sm font-medium text-foreground">所屬部門</label>
            <Field id="department" name="department" as="input"
              class="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground"
              placeholder="例：業務部"
            />
          </div>
        </div>

        <!-- 表單按鈕（在 form 內，確保 submit 正確觸發）-->
        </div><!-- end scroll wrapper -->
        <div class="flex justify-end gap-2 border-t pt-4 mt-2">
          <Button type="button" variant="outline" class="text-foreground" @click="closeDialog">取消</Button>
          <Button type="button" @click="onSubmit">儲存送出</Button>
        </div>

      </form>
    </template>
  </AppDialog>
</template>

<style scoped>
:deep([data-slot='dialog-close']) {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 0.6);
}

:deep([data-slot='dialog-close']:hover) {
  background: hsl(var(--muted));
}
</style>