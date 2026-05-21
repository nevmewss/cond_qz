<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$recipient = 'wind.lviv@gmail.com';

$name = trim((string) ($_POST['name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$comment = trim((string) ($_POST['comment'] ?? ''));
$source = trim((string) ($_POST['source'] ?? 'air-conditioner-lviv-quiz'));
$submittedAt = trim((string) ($_POST['submitted_at'] ?? ''));
$answersText = trim((string) ($_POST['answers_text'] ?? ''));

if ($name === '' || $phone === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Missing required fields'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($answersText === '' && isset($_POST['answers_json'])) {
    $decodedAnswers = json_decode((string) $_POST['answers_json'], true);

    if (is_array($decodedAnswers)) {
        $lines = [];

        foreach ($decodedAnswers as $index => $item) {
            $question = trim((string) ($item['question'] ?? ''));
            $answer = trim((string) ($item['answer'] ?? ''));
            $number = (int) $index + 1;
            $lines[] = $number . '. ' . $question . ': ' . $answer;
        }

        $answersText = implode(PHP_EOL, $lines);
    }
}

$messageParts = [
    'Нова заявка з квізу по кондиціонерах у Львові',
    '',
    'Ім\'я: ' . $name,
    'Телефон: ' . $phone,
    'Коментар: ' . ($comment !== '' ? $comment : 'Не вказано'),
    'Джерело: ' . $source,
    'Дата: ' . ($submittedAt !== '' ? $submittedAt : date('c')),
    '',
    'Відповіді з квізу:',
    $answersText !== '' ? $answersText : 'Немає даних',
];

$message = implode(PHP_EOL, $messageParts);
$subjectText = 'Нова заявка з квізу по кондиціонерах у Львові';
$subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
$host = preg_replace('/[^a-z0-9.-]/i', '', (string) ($_SERVER['HTTP_HOST'] ?? 'localhost'));
$fromEmail = 'no-reply@' . ($host !== '' ? $host : 'localhost');

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . $fromEmail,
    'Reply-To: ' . $fromEmail,
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($recipient, $subject, $message, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Не вдалося відправити лист'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
