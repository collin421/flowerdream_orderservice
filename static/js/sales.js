document.addEventListener('DOMContentLoaded', function() {
    loadBranches();
    // 매출 입력 폼 요소에 대한 참조
    const saleDate = document.getElementById('saleDate');
    const branchSelect = document.getElementById('branchSelect');
    const emailSelect = document.getElementById('emailSelect');
    const submitButton = document.getElementById('submitSalesButton'); // 매출 입력 버튼의 ID를 'submitSalesButton'으로 가정

    // 지점 선택 시 이메일 옵션 업데이트 이벤트 리스너
    branchSelect.addEventListener('change', function() {
        const branchId = this.value;
        updateEmailOptions(branchId);
    });

    // 날짜, 지점, 이메일 선택 상태에 따른 버튼 활성화/비활성화 이벤트 리스너
    [saleDate, branchSelect, emailSelect].forEach(item => {
        item.addEventListener('change', updateSubmitButtonState);
    });

    // 초기 버튼 상태 업데이트
    updateSubmitButtonState();
});

function loadBranches() {
    fetch('/api/branches')
        .then(response => response.json())
        .then(branches => {
            const branchSelect = document.getElementById('branchSelect');
            branchSelect.innerHTML = '<option disabled selected value="">지점 선택</option>';
            branches.forEach(branch => {
                const option = new Option(branch.name, branch.id);
                branchSelect.add(option);
            });
        })
        .catch(error => console.log('Error loading branches:', error));
}

function updateEmailOptions(branchId) {
    const emailSelect = document.getElementById('emailSelect');
    fetch(`/api/branch/${branchId}/emails`)
        .then(response => response.json())
        .then(data => {
            emailSelect.innerHTML = ''; // Clear existing options
            if (data.emails && data.emails.length > 0) {
                data.emails.forEach(email => {
                    const option = new Option(email, email);
                    emailSelect.add(option);
                });
            } else {
                // 이메일 정보가 없는 경우 처리
                const option = new Option("이메일 정보 없음", "");
                emailSelect.add(option);
            }
            updateSubmitButtonState(); // 이메일 업데이트 후 버튼 상태 업데이트
        })
        .catch(error => console.log('Error updating email options:', error));
}

// 버튼 활성화/비활성화 상태를 업데이트하는 함수
function updateSubmitButtonState() {
    const saleDate = document.getElementById('saleDate').value;
    const branchId = document.getElementById('branchSelect').value;
    const email = document.getElementById('emailSelect').value;
    const submitButton = document.getElementById('submitSalesButton');

    // 날짜, 지점, 이메일이 모두 선택되었는지 확인
    submitButton.disabled = !(saleDate && branchId && email);
}

// 폼 제출 전에 입력 값 확인 및 기본값 설정
document.getElementById('salesForm').addEventListener('submit', function(event) {
    ['sales_card_sweetdream', 'sales_card_glory', 'sales_cash', 'sales_zeropay', 'sales_transfer'].forEach(inputId => {
        const inputElement = document.getElementById(inputId);
        if (inputElement && inputElement.value === '') {
            inputElement.value = '0';
        }
    });
});