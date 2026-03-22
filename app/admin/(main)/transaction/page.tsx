"use client"

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth"
import { useEffect, useState } from "react"
import {
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"

interface Transaction {
  _id: string
  jobId: {
    _id: string
    title: string
  }
  clientId: {
    _id: string
    name: string
    lastName: string
  }
  freelancerId: {
    _id: string
    name: string
    lastName: string
  }
  totalAmount: number
  freelancerAmount: number
  transactionId: string
  method: string
  status: string
  createdAt: string
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof Transaction>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10


  useEffect(() => {
    fetchWithAuth("/api/admin/fetchalltransactions")
      .then((response) => response.json())
      .then((data) => {
        const transactionsArray = Array.isArray(data.transactions) ? data.transactions : []
        setTransactions(transactionsArray)
        setFilteredTransactions(transactionsArray)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = [...transactions]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (transaction) =>
          transaction.jobId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${transaction.clientId.name} ${transaction.clientId.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${transaction.freelancerId.name} ${transaction.freelancerId.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((transaction) => transaction.status === statusFilter)
    }

    // Apply method filter
    if (methodFilter !== "all") {
      result = result.filter((transaction) => transaction.method === methodFilter)
    }

    setFilteredTransactions(result)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, methodFilter, transactions])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const sortTransactions = (field: keyof Transaction) => {
    setSortField(field)
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"))

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      let compareA = field === "createdAt" ? new Date(a[field]).getTime() : a[field]
      let compareB = field === "createdAt" ? new Date(b[field]).getTime() : b[field]


   
      if (sortDirection === "asc") {
        return compareA > compareB ? 1 : -1
      } else {
        return compareA < compareB ? 1 : -1
      }
    })

    setFilteredTransactions(sortedTransactions)
  }

  const totalAmount = filteredTransactions?.reduce((sum, transaction) => sum + transaction.totalAmount, 0)
  const completedTransactions = filteredTransactions?.filter((t) => t.status === "completed").length
  const failedTransactions = filteredTransactions?.filter((t) => t.status === "failed").length

  // Pagination
  const totalPages = Math.ceil(filteredTransactions?.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-xl font-semibold text-gray-900">Rs {totalAmount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Transactions</p>
              <p className="text-xl font-semibold text-gray-900">{completedTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed Transactions</p>
              <p className="text-xl font-semibold text-gray-900">{failedTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <select
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <select
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="esewa">eSewa</option>
                <option value="khalti">Khalti</option>
                <option value="paypal">Paypal</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FunnelIcon className="h-5 w-5" />
              <span>{filteredTransactions?.length} results</span>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <ClockIcon className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => sortTransactions("createdAt")}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Date</span>
                        <ArrowsUpDownIcon className="w-4 h-4" />
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => sortTransactions("jobId")}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Job Title</span>
                        <ArrowsUpDownIcon className="w-4 h-4" />
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Client
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Freelancer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTransactions?.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.jobId.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {`${transaction.clientId.name} ${transaction.clientId.lastName}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {`${transaction.freelancerId.name} ${transaction.freelancerId.lastName}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-900 ">
                        Rs {transaction.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize
                            ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredTransactions?.length)} of {filteredTransactions?.length}{" "}
                  results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TransactionsPage

