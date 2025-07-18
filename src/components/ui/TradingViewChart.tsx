'use client'
import { useEffect, useRef } from 'react'

declare global {
    interface Window {
        TradingView?: any;
    }
}

type Props = {
    symbol: string
    interval?: string
    theme?: 'light' | 'dark'
    height?: number
}

const TradingViewChart = ({
    symbol,
    interval = '15',
    theme = 'dark',
    height = 500
}: Props) => {
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        containerRef.current.innerHTML = '' // ❗ เคลียร์ container เดิม

        const renderChart = () => {
            // @ts-ignore
            new window.TradingView.widget({
                container_id: 'main_tv_chart',
                width: '100%',
                height,
                symbol,
                interval,
                timezone: 'Asia/Bangkok',
                theme,
                style: '1',
                locale: 'th',
                toolbar_bg: '#0d1117',
                enable_publishing: false,
                hide_legend: false,
                save_image: false,
                studies: [],
                show_popup_button: true,
                popup_width: '1000',
                popup_height: '650'
            })
        }

        if (typeof window.TradingView === 'undefined') {
            const script = document.createElement('script')
            script.src = 'https://s3.tradingview.com/tv.js'
            script.async = true
            script.onload = renderChart
            document.body.appendChild(script)
        } else {
            renderChart()
        }
    }, [symbol, interval, theme, height])

    return <div id="main_tv_chart" ref={containerRef} style={{ height }} />
}

export default TradingViewChart
