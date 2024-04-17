$(document).ready(function() {
    // URL에서 탭 정보를 추출하여 해당 탭을 활성화
    var urlParams = new URLSearchParams(window.location.search);
    var tab = urlParams.get('tab');
    
    if (tab) {
        $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    }
});

function editBranch(branchId) {
    // 지점 이름과 이메일의 현재 값을 입력 필드로 변환
    var nameCell = document.getElementById('name_' + branchId);
    var emailCell = document.getElementById('email_' + branchId);
    var nameValue = nameCell.innerText;
    var emailValue = emailCell.innerText;

    nameCell.innerHTML = `<input type="text" id="inputName_${branchId}" value="${nameValue}" class="form-control">`;
    emailCell.innerHTML = `<input type="email" id="inputEmail_${branchId}" value="${emailValue}" class="form-control">`;

    // '저장' 버튼으로 '수정' 버튼을 교체
    var actionCell = document.getElementById('action_' + branchId);
    actionCell.innerHTML = `<button onclick="saveBranch(${branchId})" class="btn btn-success btn-sm" style="margin-right: 5px;">저장</button>` +
                           `<button onclick="cancelEdit(${branchId}, '${nameValue}', '${emailValue}')" class="btn btn-secondary btn-sm">취소</button>`;
}

function saveBranch(branchId) {
    var newName = document.getElementById('inputName_' + branchId).value.trim();
    var newEmail = document.getElementById('inputEmail_' + branchId).value.trim();

    // 이름과 이메일이 모두 입력되었는지 확인
    if (!newName || !newEmail) {
        alert('지점 이름과 이메일을 모두 입력해주세요.');
        return;
    }

    // 서버에 업데이트 요청을 전송
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/edit_branch/" + branchId, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        if (xhr.status === 200) {
            location.reload();
        } else {
            alert('수정에 실패했습니다.');
        }
    };
    xhr.send(`name=${encodeURIComponent(newName)}&email=${encodeURIComponent(newEmail)}`);
}

function cancelEdit(branchId, nameValue, emailValue) {
    // 편집 취소 버튼을 누를 경우 원래 상태로 복구
    var nameCell = document.getElementById('name_' + branchId);
    var emailCell = document.getElementById('email_' + branchId);
    nameCell.innerText = nameValue;
    emailCell.innerText = emailValue;

    // '수정'과 '삭제' 버튼을 다시 표시
    var actionCell = document.getElementById('action_' + branchId);
    actionCell.innerHTML = `<button onclick="editBranch(${branchId})" class="btn btn-warning btn-sm" style="margin-right: 5px;">수정</button>` +
                           `<form method="post" style="display: inline;"><input type="hidden" name="delete" value="${branchId}"><button type="submit" class="btn btn-danger btn-sm">삭제</button></form>`;
}
