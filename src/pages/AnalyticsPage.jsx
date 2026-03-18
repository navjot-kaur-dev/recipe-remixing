import React, { useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { analyticsAPI } from '@/services/api'
import { formatNumber } from '@/utils/helpers'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styles from './AnalyticsPage.module.css'

// Fallback mock data shown while real data loads
const MOCK_WEEKLY = [
  { day:'Mon', views:8200,  likes:320 },
  { day:'Tue', views:12400, likes:480 },
  { day:'Wed', views:9800,  likes:390 },
  { day:'Thu', views:15600, likes:620 },
  { day:'Fri', views:11200, likes:440 },
  { day:'Sat', views:18900, likes:780 },
  { day:'Sun', views:21000, likes:840 },
]
const MOCK_MONTHLY = [
  { month:'Oct', saves:1200, views:42000 },
  { month:'Nov', saves:1850, views:68000 },
  { month:'Dec', saves:2400, views:89000 },
  { month:'Jan', saves:1900, views:71000 },
  { month:'Feb', saves:3100, views:112000 },
  { month:'Mar', saves:3847, views:142000 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', fontSize:'0.82rem', boxShadow:'var(--shadow)' }}>
      <p style={{ fontWeight:700, color:'var(--text)', marginBottom:4 }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color:p.color }}>{p.name}: <strong>{Number(p.value).toLocaleString()}</strong></p>)}
    </div>
  )
}

export default function AnalyticsPage() {
  const { recipes } = useApp()
  const [overview, setOverview] = useState(null)
  const [weekly,   setWeekly]   = useState(MOCK_WEEKLY)
  const [apiLoad,  setApiLoad]  = useState(true)

  useEffect(() => {
    // GET /api/analytics/overview
    // Returns { totalViews, totalLikes, totalComments, totalSaves, recipesShared, avgRating, shares }
    // GET /api/analytics/weekly
    // Returns { data: [{ day, views, likes }] }
    Promise.all([
      analyticsAPI.getOverview().catch(() => null),
      analyticsAPI.getWeekly().catch(() => null),
    ]).then(([ov, wk]) => {
      if (ov) setOverview(ov)
      if (wk?.data?.length) setWeekly(wk.data)
    }).finally(() => setApiLoad(false))
  }, [])

  const sorted = [...recipes].sort((a, b) => (b.views||0) - (a.views||0))

  // Build metric cards — use real backend data if available, else show mock
  const metrics = [
    { icon:'👀', val:(overview?.totalViews    ?? 48291).toLocaleString(),  label:'Total Views',    change:'+23%', up:true  },
    { icon:'❤️', val:(overview?.totalLikes    ?? 3847).toLocaleString(),   label:'Total Likes',    change:'+18%', up:true  },
    { icon:'💬', val:(overview?.totalComments ?? 892).toLocaleString(),    label:'Comments',       change:'+31%', up:true  },
    { icon:'🔖', val:(overview?.totalSaves    ?? 6123).toLocaleString(),   label:'Bookmarks',      change:'−4%',  up:false },
    { icon:'👥', val:(overview?.newFollowers  ?? 1204).toLocaleString(),   label:'New Followers',  change:'+12%', up:true  },
    { icon:'🍴', val:(overview?.recipesShared ?? recipes.length).toLocaleString(), label:'Recipes Shared', change:'+8%', up:true },
    { icon:'⭐', val: String(overview?.avgRating  ?? '4.87'),              label:'Avg Rating',     change:'+0.2', up:true  },
    { icon:'📤', val:(overview?.shares        ?? 2341).toLocaleString(),   label:'Shares',         change:'+44%', up:true  },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>📊 Recipe Analytics</h1>
        <p>Track performance and understand your audience{apiLoad ? ' — loading live data…' : ''}</p>
      </div>

      <div className={styles.metricsGrid}>
        {metrics.map(m => (
          <div key={m.label} className={styles.metricCard}>
            <div className={styles.metricIcon}>{m.icon}</div>
            <div className={styles.metricVal}>{m.val}</div>
            <div className={styles.metricLabel}>{m.label}</div>
            <div className={`${styles.metricChange} ${m.up ? styles.up : styles.down}`}>{m.change} this week</div>
          </div>
        ))}
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Views & Likes — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weekly} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day"   tick={{ fontSize:12, fill:'var(--text3)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'var(--text3)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize:12, color:'var(--text2)' }} />
            <Bar dataKey="views" name="Views" fill="var(--accent)"  radius={[4,4,0,0]} />
            <Bar dataKey="likes" name="Likes" fill="var(--accent2)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Growth Trend — Last 6 Months</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={MOCK_MONTHLY}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize:12, fill:'var(--text3)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'var(--text3)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize:12, color:'var(--text2)' }} />
            <Line type="monotone" dataKey="views" name="Views" stroke="var(--accent)"  strokeWidth={2.5} dot={{ r:4, fill:'var(--accent)' }} />
            <Line type="monotone" dataKey="saves" name="Saves" stroke="var(--accent3)" strokeWidth={2.5} dot={{ r:4, fill:'var(--accent3)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Top Performing Recipes</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>#</th><th>Recipe</th><th>Views</th><th>Saves</th><th>Likes</th><th>Engagement</th></tr></thead>
            <tbody>
              {sorted.map((r, i) => {
                const eng = Math.round(((r.likes||0) / Math.max(r.views||1, 1)) * 100)
                return (
                  <tr key={r.id}>
                    <td className={styles.rank}>{i+1}</td>
                    <td><div className={styles.recipeCell}><span>{r.emoji||'🍳'}</span><span>{r.title}</span></div></td>
                    <td>{(r.views||0).toLocaleString()}</td>
                    <td>{formatNumber(r.saves||0)}</td>
                    <td>{formatNumber(r.likes||0)}</td>
                    <td>
                      <div className={styles.progressWrap}>
                        <div className={styles.progressBar} style={{ width:`${Math.min(eng*2,100)}%` }} />
                        <span className={styles.progressLabel}>{eng}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
