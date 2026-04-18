import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/table-registry')({
  component: TableRegistryPage,
})

function TableRegistryPage() {
  const mockData = [
    { id: 1, name: 'Item 1', status: 'Active' },
    { id: 2, name: 'Item 2', status: 'Inactive' },
    { id: 3, name: 'Item 3', status: 'Pending' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Table Registry</h1>
      <table className="w-full border-collapse border border-muted">
        <thead>
          <tr className="bg-muted">
            <th className="border border-muted p-2 text-left">ID</th>
            <th className="border border-muted p-2 text-left">Name</th>
            <th className="border border-muted p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((item) => (
            <tr key={item.id}>
              <td className="border border-muted p-2">{item.id}</td>
              <td className="border border-muted p-2">{item.name}</td>
              <td className="border border-muted p-2">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
