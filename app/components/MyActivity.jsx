'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './MyActivity.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';

export default function MyActivity() {
  const [activities, setActivities] = useState({ comments: [], qas: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' or 'qas'

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me/activities`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (err) {
        console.error("활동 내역 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) return <div>활동 내역 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.tabMenu}>
        <button 
          className={activeTab === 'comments' ? styles.active : ''} 
          onClick={() => setActiveTab('comments')}
        >
          내가 쓴 댓글 ({activities.comments.length})
        </button>
        <button 
          className={activeTab === 'qas' ? styles.active : ''} 
          onClick={() => setActiveTab('qas')}
        >
          내가 쓴 문의 ({activities.qas.length})
        </button>
      </div>

      <div className={styles.list}>
        {activeTab === 'comments' ? (
          activities.comments.length > 0 ? (
            activities.comments.map(item => (
              <div key={item.id} className={styles.item}>
                <p className={styles.content}>{item.content}</p>
                <Link href={`/articles/${item.articleId}`} className={styles.originLink}>
                  원문: {item.article?.title}
                </Link>
                <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : <p>작성한 댓글이 없습니다.</p>
        ) : (
          activities.qas.length > 0 ? (
            activities.qas.map(item => (
              <div key={item.id} className={styles.item}>
                <p className={styles.content}>{item.content}</p>
                <Link href={`/products/${item.productId}`} className={styles.originLink}>
                  상품: {item.product?.name}
                </Link>
                <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : <p>작성한 문의가 없습니다.</p>
        )}
      </div>
    </div>
  );
}