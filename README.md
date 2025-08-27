# Платформа для менторства

Веб-приложение, разработанное для соединения менторов и студентов, предоставляющее удобный интерфейс для поиска и взаимодействия между участниками образовательного процесса.


## Демонстрация работы

![Рисунок1](https://github.com/user-attachments/assets/3880f517-4dc5-4bc5-b768-031c90464a6d)
![Рисунок2](https://github.com/user-attachments/assets/898285f6-8f7d-4a0f-9914-ef87f36c2ce6)
### Демонстрация работы сайта. Рекомендации выдаются на основе данных профиля

<img width="716" height="513" alt="Рисунок3" src="https://github.com/user-attachments/assets/64056f6f-e257-4eeb-8eff-84d58e060ae3" />
<img width="965" height="513" alt="Рисунок4" src="https://github.com/user-attachments/assets/e28804a5-072b-4ee9-915f-f9f230f5e5a3" />

> Настроен вывод метрик в Grafana. Присутствуют как бизнес метрики, так и технические

<img width="1680" height="989" alt="Рисунок5" src="https://github.com/user-attachments/assets/3774fbd9-24f5-4571-a86e-bb8e90816604" />

> Схема микросервисной архитектуры

## Установка и запуск

1. Клонировать репозиторий:
```bash
git clone https://github.com/Alex-Depost/menti
```

2. Установить зависимости:
```bash
docker compose up
```


## Стек технологий

### Frontend
- Framework: Next.js с TypeScript
- Стилизация: Tailwind CSS

### Backend
- Framework: FastAPI
- СУБД: PostgreSQL
- ORM: Sqlalchemy

### Другое
- Кеширование: Redis
- Мониторинг: Grafana, Prometheus, node exporter
- Деплой: Docker compose
