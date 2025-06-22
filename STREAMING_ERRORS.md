# Xử lý lỗi Streaming Video

## 🔍 Vấn đề: `ERR_STREAM_PREMATURE_CLOSE`

Lỗi này xảy ra khi client đột ngột ngắt kết nối trong khi server đang stream video. Đây là **lỗi bình thường** và không ảnh hưởng đến hoạt động của ứng dụng.

### 📋 Nguyên nhân phổ biến:

1. **User tua video** (seek) - Browser hủy request cũ và tạo request mới
2. **User đóng tab/browser** đột ngột
3. **Mất kết nối mạng** tạm thời
4. **User pause/play** liên tục
5. **Browser cache** video và ngắt stream

### ✅ Giải pháp đã triển khai:

#### 1. **Cải thiện Stream Event Handlers**
```typescript
// Xử lý nhiều loại lỗi streaming
stream.on('error', (err) => {
  if (err.code === 'ECONNRESET' || 
      err.code === 'ERR_STREAM_PREMATURE_CLOSE' ||
      err.code === 'EPIPE' ||
      err.code === 'ECONNABORTED') {
    console.log(`Client disconnected: ${err.code}`);
  }
});
```

#### 2. **Client Disconnect Detection**
```typescript
// Lắng nghe khi client ngắt kết nối
res.req.on('close', () => {
  if (!file.destroyed) {
    file.destroy();
  }
});
```

#### 3. **Streaming Exception Filter**
- Filter riêng để xử lý lỗi streaming
- Log ở level DEBUG thay vì ERROR
- Không gửi response nếu connection đã đóng

#### 4. **Memory Management**
```typescript
// Đảm bảo stream được destroy để tránh memory leak
stream.on('end', () => {
  if (!stream.destroyed) {
    stream.destroy();
  }
});
```

### 🎯 Kết quả:

- ✅ Giảm log error spam
- ✅ Tránh memory leaks
- ✅ Xử lý graceful disconnect
- ✅ Cải thiện performance streaming

### 📊 Monitoring:

Để theo dõi streaming health:

```bash
# Check log levels
tail -f logs/app.log | grep "Client disconnected"

# Monitor memory usage
ps aux | grep node
```

### 🔧 Configuration:

Trong `main.ts`, có thể enable global filters:
```typescript
app.useGlobalFilters(
  new HttpExceptionFilter(),
  new PrismaExceptionFilter(),
  new StreamingExceptionFilter() // Xử lý streaming errors
);
```

## 📝 Lưu ý:

- Lỗi `ERR_STREAM_PREMATURE_CLOSE` là **BÌNH THƯỜNG** trong video streaming
- Không cần fix nếu video vẫn chạy tốt cho users
- Chỉ cần đảm bảo logs không bị spam và memory không leak 