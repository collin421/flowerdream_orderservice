$(document).ready(function() {
    var urlParams = new URLSearchParams(window.location.search);
    var tab = urlParams.get('tab');
    
    if (tab) {
        $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    }
});


function editProduct(productId) {
    console.log(`Editing product with ID: ${productId}`); // 동작 확인을 위한 로그
    var nameCell = document.getElementById('name_' + productId);
    var colorCell = document.getElementById('color_' + productId);
    var nameValue = nameCell.innerText;
    var colorValue = colorCell.innerText;

    // 텍스트 필드로 변환
    nameCell.innerHTML = `<input type="text" id="inputName_${productId}" value="${nameValue}" class="form-control">`;
    colorCell.innerHTML = `<input type="text" id="inputColor_${productId}" value="${colorValue}" class="form-control">`;

    // 수정 버튼을 저장 버튼으로 변경
    var actionCell = document.getElementById('action_' + productId);
    actionCell.innerHTML = `<button onclick="saveProduct(${productId})" class="btn btn-success btn-sm">저장</button>`;
}

function saveProduct(productId) {
    console.log(`Saving product with ID: ${productId}`); // 동작 확인을 위한 로그
    var newName = document.getElementById('inputName_' + productId).value.trim();
    var newColor = document.getElementById('inputColor_' + productId).value.trim();

    // 필드 검증
    if (!newName || !newColor) {
        alert('제품 이름과 색상을 모두 입력해주세요.');
        return;
    }

    // AJAX 요청 설정
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/edit_product/" + productId, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        if (xhr.status == 200) {
            // 페이지에서 직접 텍스트 업데이트
            document.getElementById('name_' + productId).innerText = newName;
            document.getElementById('color_' + productId).innerText = newColor;

            // 저장 버튼을 다시 수정 버튼으로 변경하고 삭제 버튼도 유지
            var actionCell = document.getElementById('action_' + productId);
            actionCell.innerHTML = `
                <button onclick="editProduct(${productId})" class="btn btn-warning btn-sm">수정</button>
                <form method="post" style="display: inline;">
                    <input type="hidden" name="delete" value="${productId}">
                    <button type="submit" class="btn btn-danger btn-sm">삭제</button>
                </form>
            `;
        } else {
            alert('수정에 실패했습니다.');
        }
    };
    xhr.send(`name=${encodeURIComponent(newName)}&color=${encodeURIComponent(newColor)}`);
}

function toggleSortOrder() {
    var currentUrl = window.location.href;
    var url = new URL(currentUrl);
    var sort = url.searchParams.get("sort");

    // 현재 정렬 상태에 따라 새 정렬 상태를 결정
    if (sort === "name") {
        url.searchParams.set("sort", "name desc");
    } else {
        url.searchParams.set("sort", "name");
    }

    // 변경된 URL로 페이지 이동
    window.location.href = url.href;
}
