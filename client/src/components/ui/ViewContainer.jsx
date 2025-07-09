import PageHeader from './PageHeader'

export default function ViewContainer({ title, subtitle, children }) {
  return (
    <div className="absolute top-0 left-[210px] right-[20px] bottom-0 text-[#5a5a5a] p-[10px] pr-0 mr-0 flex flex-col overflow-hidden">
      <PageHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  )
}