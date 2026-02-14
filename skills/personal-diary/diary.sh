#!/bin/bash
# 个人日记系统 - 智能梳理脚本

DIARY_DIR="/root/.openclaw/workspace/diary"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
YEAR=$(date +%Y)
WEEKDAY=$(date +%A)

# 确保目录存在
mkdir -p "$DIARY_DIR/$YEAR"

# 获取天气（模拟广州天气）
get_weather() {
    # 这里可以接入真实天气 API
    echo "广州 $(date +%m月%d日) 多云 22°C 湿度65%"
}

# 生成标题（基于内容）
generate_title() {
    local content="$1"
    # 提取前20字作为标题
    echo "$content" | head -c 30 | sed 's/[[:space:]]*$//'
}

# 生成摘要（不多于100字）
generate_summary() {
    local content="$1"
    # 提取前100字
    echo "$content" | head -c 100 | sed 's/[[:space:]]*$//...'
}

# 梳理上一天的日记
organize_last_diary() {
    local last_date=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || echo "")
    local last_file="$DIARY_DIR/$YEAR/${last_date}.md"
    
    if [ -f "$last_file" ]; then
        echo "📋 已梳理昨日日记: $last_date"
        # 这里可以添加自动摘要、关键词提取等
    fi
}

# 创建今日日记
create_today_diary() {
    local diary_file="$DIARY_DIR/$YEAR/${DATE}.md"
    
    # 检查是否已存在
    if [ -f "$diary_file" ]; then
        echo "📝 继续记录今日日记..."
        return
    fi
    
    # 梳理昨日日记
    organize_last_diary
    
    # 创建新日记
    cat > "$diary_file" <> EOF
# 日记 - ${DATE}

## 📋 日记信息
- **日期**: ${DATE} ${WEEKDAY}
- **时间**: ${TIME}
- **天气**: $(get_weather)
- **地点**: 广州

## 📝 标题
（待填写）

## 📄 摘要
（待填写，不多于100字）

## 🖊️ 日记内容

### 上午

### 下午

### 晚上

## 💭 感想与反思

## ✅ 明日计划

---
*最后更新: ${TIME}*
EOF

    echo "✅ 已创建今日日记: ${DATE}"
}

# 添加日记内容
add_diary_content() {
    local content="$1"
    local section="${2:-其他}"
    local diary_file="$DIARY_DIR/$YEAR/${DATE}.md"
    
    # 确保日记存在
    [ ! -f "$diary_file" ] && create_today_diary
    
    # 添加内容
    echo "" >> "$diary_file"
    echo "### ${section} (${TIME})" >> "$diary_file"
    echo "" >> "$diary_file"
    echo "$content" >> "$diary_file"
    echo "" >> "$diary_file"
    echo "*记录时间: ${TIME}*" >> "$diary_file"
    
    echo "✅ 已记录到日记"
}

# 更新标题和摘要
update_title_summary() {
    local title="$1"
    local summary="$2"
    local diary_file="$DIARY_DIR/$YEAR/${DATE}.md"
    
    # 使用 sed 更新标题和摘要
    sed -i "s/（待填写）/${title}/" "$diary_file"
    sed -i "0,/(待填写，不多于100字)/s//${summary}/" "$diary_file"
}

# 主函数
case "$1" in
    create)
        create_today_diary
        ;;
    add)
        add_diary_content "$2" "$3"
        ;;
    organize)
        organize_last_diary
        ;;
    *)
        create_today_diary
        ;;
esac
