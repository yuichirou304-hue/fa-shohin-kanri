import CustomerForm from '@/components/CustomerForm'

export default function NewCustomerPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">顧客 新規登録</h2>
      <CustomerForm />
    </div>
  )
}
