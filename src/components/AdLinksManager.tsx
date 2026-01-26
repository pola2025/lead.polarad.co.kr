"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Check, Link2, ExternalLink, Pencil, X } from "lucide-react";
import type { AdLink } from "@/types";

interface AdLinksManagerProps {
  clientSlug: string;
  adLinks: AdLink[];
  onUpdate: (adLinks: AdLink[]) => void;
  isReadOnly?: boolean; // 포털에서는 읽기 전용으로 표시
}

export default function AdLinksManager({
  clientSlug,
  adLinks,
  onUpdate,
  isReadOnly = false,
}: AdLinksManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<Partial<AdLink>>({
    slug: "",
    utmSource: "meta",
    utmAd: "",
    memo: "",
  });
  const [editLink, setEditLink] = useState<AdLink | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://lead.polarad.co.kr";

  // 슬러그 유효성 검사
  const isValidSlug = (slug: string): boolean => {
    return /^[a-zA-Z0-9가-힣_-]+$/.test(slug) && slug.length > 0;
  };

  // 슬러그 중복 검사
  const isDuplicateSlug = (slug: string): boolean => {
    return adLinks.some((link) => link.slug === slug);
  };

  // 새 링크 추가
  const handleAdd = () => {
    if (!newLink.slug || !newLink.utmSource || !newLink.utmAd) {
      alert("슬러그, 광고 소스, 광고명은 필수입니다.");
      return;
    }

    if (!isValidSlug(newLink.slug)) {
      alert("슬러그는 영문, 숫자, 한글, 하이픈(-), 언더스코어(_)만 사용 가능합니다.");
      return;
    }

    if (isDuplicateSlug(newLink.slug)) {
      alert("이미 사용 중인 슬러그입니다.");
      return;
    }

    const addedLink: AdLink = {
      slug: newLink.slug,
      utmSource: newLink.utmSource,
      utmAd: newLink.utmAd,
      memo: newLink.memo || undefined,
    };

    onUpdate([...adLinks, addedLink]);
    setNewLink({ slug: "", utmSource: "meta", utmAd: "", memo: "" });
    setIsAdding(false);
  };

  // 링크 삭제
  const handleDelete = (slug: string) => {
    if (!confirm("이 광고 링크를 삭제하시겠습니까?")) return;
    onUpdate(adLinks.filter((link) => link.slug !== slug));
  };

  // 수정 시작
  const handleEditStart = (link: AdLink) => {
    setEditingSlug(link.slug);
    setEditLink({ ...link });
  };

  // 수정 취소
  const handleEditCancel = () => {
    setEditingSlug(null);
    setEditLink(null);
  };

  // 수정 저장
  const handleEditSave = () => {
    if (!editLink || !editingSlug) return;

    if (!editLink.utmSource || !editLink.utmAd) {
      alert("광고 소스, 광고명은 필수입니다.");
      return;
    }

    // 슬러그가 변경된 경우 중복 검사
    if (editLink.slug !== editingSlug) {
      if (!isValidSlug(editLink.slug)) {
        alert("슬러그는 영문, 숫자, 한글, 하이픈(-), 언더스코어(_)만 사용 가능합니다.");
        return;
      }
      if (isDuplicateSlug(editLink.slug)) {
        alert("이미 사용 중인 슬러그입니다.");
        return;
      }
    }

    const updated = adLinks.map((link) =>
      link.slug === editingSlug ? editLink : link
    );
    onUpdate(updated);
    setEditingSlug(null);
    setEditLink(null);
  };

  // 링크 복사
  const handleCopy = async (slug: string) => {
    const url = `${baseUrl}/l/${clientSlug}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          광고 추적 링크
        </h3>
        {!isReadOnly && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            링크 추가
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        광고별 전용 URL을 생성하여 UTM 파라미터 없이도 광고 유입을 추적할 수 있습니다.
      </p>

      {/* 새 링크 추가 폼 */}
      {isAdding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-blue-900">새 광고 링크 추가</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                슬러그 (URL 경로) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newLink.slug}
                onChange={(e) => setNewLink({ ...newLink, slug: e.target.value.trim() })}
                placeholder="meta-1월캠페인"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                URL: /l/{clientSlug}/{newLink.slug || "슬러그"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                광고 소스 <span className="text-red-500">*</span>
              </label>
              <select
                value={newLink.utmSource}
                onChange={(e) => setNewLink({ ...newLink, utmSource: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="meta">Meta (Facebook/Instagram)</option>
                <option value="google">Google</option>
                <option value="naver">Naver</option>
                <option value="kakao">Kakao</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                광고명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newLink.utmAd}
                onChange={(e) => setNewLink({ ...newLink, utmAd: e.target.value })}
                placeholder="1월 신규고객 캠페인"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                메모 (선택)
              </label>
              <input
                type="text"
                value={newLink.memo}
                onChange={(e) => setNewLink({ ...newLink, memo: e.target.value })}
                placeholder="메모"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewLink({ slug: "", utmSource: "meta", utmAd: "", memo: "" });
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 링크 목록 */}
      {adLinks.length > 0 ? (
        <div className="space-y-2">
          {adLinks.map((link) => (
            <div
              key={link.slug}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              {editingSlug === link.slug && editLink ? (
                /* 수정 모드 */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        슬러그 (URL 경로)
                      </label>
                      <input
                        type="text"
                        value={editLink.slug}
                        onChange={(e) => setEditLink({ ...editLink, slug: e.target.value.trim() })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        광고 소스
                      </label>
                      <select
                        value={editLink.utmSource}
                        onChange={(e) => setEditLink({ ...editLink, utmSource: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="meta">Meta (Facebook/Instagram)</option>
                        <option value="google">Google</option>
                        <option value="naver">Naver</option>
                        <option value="kakao">Kakao</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="other">기타</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        광고명
                      </label>
                      <input
                        type="text"
                        value={editLink.utmAd}
                        onChange={(e) => setEditLink({ ...editLink, utmAd: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        메모
                      </label>
                      <input
                        type="text"
                        value={editLink.memo || ""}
                        onChange={(e) => setEditLink({ ...editLink, memo: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleEditSave}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                /* 보기 모드 */
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {link.slug}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                        {link.utmSource}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      광고명: {link.utmAd}
                    </p>
                    {link.memo && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {link.memo}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {baseUrl}/l/{clientSlug}/{link.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(link.slug)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="링크 복사"
                    >
                      {copiedSlug === link.slug ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`/l/${clientSlug}/${link.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="새 탭에서 열기"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {!isReadOnly && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditStart(link)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(link.slug)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">등록된 광고 링크가 없습니다.</p>
          {!isReadOnly && (
            <p className="text-xs mt-1">위 &quot;링크 추가&quot; 버튼을 클릭하여 추가하세요.</p>
          )}
        </div>
      )}
    </div>
  );
}
