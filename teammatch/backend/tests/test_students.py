def _course_payload(name: str, instructor_id: str):
    return {
        "name": name,
        "instructor_id": instructor_id,
        "team_size": 4,
    }


def _student_payload(email: str, course_id: str):
    return {
        "email": email,
        "name": "Test Student",
        "course_id": course_id,
        "skills": ["Python", "SQL"],
        "experience_level": "beginner",
        "availability": ["Mon AM"],
        "leadership_preference": "leader",
        "role_preference": "flexible",
    }


def test_create_student_success(client):
    course_res = client.post("/courses/", json=_course_payload("Software Engineering", "inst-1"))
    assert course_res.status_code == 200
    course_id = course_res.json()["id"]

    create_res = client.post(
        "/students/",
        json=_student_payload("student-success@example.com", course_id),
    )

    assert create_res.status_code == 200
    student = create_res.json()
    assert student["email"] == "student-success@example.com"
    assert student["course_id"] == course_id
    assert student["skills"] == ["Python", "SQL"]
    assert student["leadership_preference"] == "leader"


def test_create_student_duplicate_email_rejected(client):
    course_res = client.post("/courses/", json=_course_payload("Databases", "inst-2"))
    assert course_res.status_code == 200
    course_id = course_res.json()["id"]

    first_res = client.post(
        "/students/",
        json=_student_payload("duplicate@example.com", course_id),
    )
    assert first_res.status_code == 200

    second_res = client.post(
        "/students/",
        json=_student_payload("duplicate@example.com", course_id),
    )

    assert second_res.status_code == 400
    assert second_res.json()["detail"] == "Student with this email already exists"
