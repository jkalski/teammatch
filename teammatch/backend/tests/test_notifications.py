def _notification_payload(student_id: str, message: str):
    return {
        "student_id": student_id,
        "course_id": "course-1",
        "instructor_id": "inst-1",
        "type": "REQUEST_UPDATE",
        "message": message,
        "flag_reason": "missing_checkins",
    }


def test_create_and_mark_single_notification_as_read(client):
    create_res = client.post("/notifications/", json=_notification_payload("student-a", "Please submit update"))
    assert create_res.status_code == 200
    notification = create_res.json()
    assert notification["is_read"] is False

    mark_res = client.patch(f"/notifications/{notification['id']}/read")
    assert mark_res.status_code == 200
    marked = mark_res.json()
    assert marked["is_read"] is True


def test_mark_all_notifications_as_read_for_student(client):
    first = client.post("/notifications/", json=_notification_payload("student-b", "Reminder 1"))
    second = client.post("/notifications/", json=_notification_payload("student-b", "Reminder 2"))
    third = client.post("/notifications/", json=_notification_payload("student-c", "Other student"))

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 200

    read_all = client.patch("/notifications/student/student-b/read-all")
    assert read_all.status_code == 200
    updated = read_all.json()

    assert len(updated) == 2
    assert all(item["is_read"] is True for item in updated)

    student_b_notifications = client.get("/notifications/student/student-b")
    assert student_b_notifications.status_code == 200
    assert all(item["is_read"] is True for item in student_b_notifications.json())

    student_c_notifications = client.get("/notifications/student/student-c")
    assert student_c_notifications.status_code == 200
    assert student_c_notifications.json()[0]["is_read"] is False


def test_mark_all_returns_empty_list_for_unknown_student(client):
    read_all = client.patch("/notifications/student/non-existent/read-all")
    assert read_all.status_code == 200
    assert read_all.json() == []
