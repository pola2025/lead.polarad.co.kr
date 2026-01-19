"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Plus, Trash2, Search, Filter, Globe, User } from "lucide-react";
import type { Blacklist, Client, BlacklistType } from "@/types";

const typeLabels: Record<BlacklistType, string> = {
  phone: "전화번호",
  kakaoId: "카카오 ID",
  ip: "IP 주소",
  keyword: "키워드",
};

export default function BlacklistPage() {
  const [blacklist, setBlacklist] = useState<Blacklist[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blacklistRes, clientsRes] = await Promise.all([
        fetch("/api/blacklist"),
        fetch("/api/clients"),
      ]);

      const blacklistData = await blacklistRes.json();
      const clientsData = await clientsRes.json();

      if (blacklistData.success) {
        setBlacklist(blacklistData.data);
      }
      if (clientsData.success) {
        setClients(clientsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return "전역 차단";
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "알 수 없음";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/blacklist?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBlacklist(blacklist.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleAdd = async (entry: Omit<Blacklist, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      const data = await res.json();
      if (data.success) {
        setBlacklist([data.data, ...blacklist]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Failed to add:", error);
    }
  };

  const filteredBlacklist = blacklist.filter((entry) => {
    const matchesSearch = entry.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient =
      !filterClient ||
      (filterClient === "global" ? !entry.clientId : entry.clientId === filterClient);
    return matchesSearch && matchesClient;
  });

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">블랙리스트 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              스팸 및 악성 접수를 차단합니다.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            차단 추가
          </button>
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="차단 값으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">전체</option>
              <option value="global">전역 차단만</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="card flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : filteredBlacklist.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-gray-500">
            <p>등록된 블랙리스트가 없습니다.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>타입</th>
                  <th>차단 값</th>
                  <th>적용 범위</th>
                  <th>사유</th>
                  <th>등록일</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBlacklist.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {typeLabels[entry.type]}
                      </span>
                    </td>
                    <td>
                      <code className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">
                        {entry.value}
                      </code>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-sm">
                        {entry.clientId ? (
                          <>
                            <User className="h-3 w-3 text-gray-400" />
                            {getClientName(entry.clientId)}
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3 text-gray-400" />
                            전역 차단
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600">
                        {entry.reason || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 추가 모달 */}
        {showAddModal && (
          <AddBlacklistModal
            clients={clients}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAdd}
          />
        )}
      </main>
    </div>
  );
}

// 추가 모달 컴포넌트
function AddBlacklistModal({
  clients,
  onClose,
  onAdd,
}: {
  clients: Client[];
  onClose: () => void;
  onAdd: (entry: Omit<Blacklist, "id" | "createdAt">) => void;
}) {
  const [formData, setFormData] = useState({
    clientId: "",
    type: "phone" as BlacklistType,
    value: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    onAdd({
      clientId: formData.clientId || undefined,
      type: formData.type,
      value: formData.value,
      reason: formData.reason || undefined,
    });

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">블랙리스트 추가</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              적용 범위
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">전역 차단 (모든 클라이언트)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}만
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차단 타입
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as BlacklistType })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="phone">전화번호</option>
              <option value="kakaoId">카카오 ID</option>
              <option value="ip">IP 주소</option>
              <option value="keyword">키워드</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차단 값 *
            </label>
            <input
              type="text"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={
                formData.type === "phone"
                  ? "010-1234-5678"
                  : formData.type === "ip"
                  ? "192.168.0.1"
                  : formData.type === "keyword"
                  ? "욕설 등"
                  : "카카오 ID"
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차단 사유
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="예: 스팸 접수"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || !formData.value}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
