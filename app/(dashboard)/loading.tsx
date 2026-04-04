export default function DashboardLoading() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-7 w-36 bg-muted rounded-lg mb-2" />
      <div className="h-4 w-48 bg-muted/60 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-44 bg-muted rounded-2xl" />
        <div className="h-44 bg-muted rounded-2xl" />
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="h-20 bg-muted rounded-2xl" />
        <div className="h-20 bg-muted rounded-2xl" />
        <div className="h-20 bg-muted rounded-2xl" />
      </div>
    </div>
  )
}
