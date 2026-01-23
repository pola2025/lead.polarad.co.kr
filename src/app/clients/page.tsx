"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Plus, Search, ExternalLink, Trash2, Key } from "lucide-react";
import type { Client } from "@/types";

const statusLabels: Record<string, { label: string; class: string }> = {
  active: { label: "활성", class: "badge-active" },
  inactive: { label: "비활성", class: "badge-inactive" },
  pending: { label: "대기", class: "badge-pending" },
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (data.success) {
        setClients(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setClients(clients.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete client:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setClients(
          clients.map((c) => (c.id === client.id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">클라이언트 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              리드 수집 랜딩 페이지 고객을 관리합니다.
            </p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            클라이언트 등록
          </Link>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름 또는 슬러그로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="card flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-gray-500">
            <p>등록된 클라이언트가 없습니다.</p>
            <Link
              href="/clients/new"
              className="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              클라이언트 등록하기
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>클라이언트</th>
                  <th>슬러그</th>
                  <th>상태</th>
                  <th>계약기간</th>
                  <th className="text-right">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        {client.logoUrl ? (
                          <img
                            src={client.logoUrl}
                            alt={client.name}
                            className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-white font-medium ${client.logoUrl ? 'hidden' : ''}`}
                          style={{
                            backgroundColor: client.primaryColor || "#3b82f6",
                          }}
                        >
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          {client.landingTitle && (
                            <p className="text-xs text-gray-500">
                              {client.landingTitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                        {client.slug}
                      </code>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(client);
                        }}
                        className={`badge ${statusLabels[client.status]?.class || "badge-pending"}`}
                      >
                        {statusLabels[client.status]?.label || "대기"}
                      </button>
                    </td>
                    <td>
                      {client.contractStart && client.contractEnd ? (
                        <span className="text-xs text-gray-500">
                          {new Date(client.contractStart).toLocaleDateString("ko-KR")} ~{" "}
                          {new Date(client.contractEnd).toLocaleDateString("ko-KR")}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">미설정</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/l/${client.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="랜딩 페이지"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a
                          href={`/portal/${client.slug}/login`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="클라이언트 포털"
                        >
                          <Key className="h-4 w-4" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client.id);
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
