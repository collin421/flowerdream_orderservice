document.addEventListener('DOMContentLoaded', function() {
    loadBranches();
    document.getElementById('addOrderItemBtn').addEventListener('click', addOrderItem);
    // '주문 항목 제거하기' 버튼에 대한 이벤트 리스너 추가
    document.getElementById('removeOrderItemBtn').addEventListener('click', removeLastOrderItem);
    document.getElementById('orderForm').addEventListener('submit', function(event) {
        event.preventDefault();
        if (validateForm()) {
            this.submit();
        }
    });
    // 입력 필드 변경 시 검사 실행
    document.getElementById('orderForm').addEventListener('input', checkFormInputs);
});

document.addEventListener('DOMContentLoaded', function() {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;

    // 기존 로드 함수들
    loadBranches();
    document.getElementById('addOrderItemBtn').addEventListener('click', addOrderItem);
    document.getElementById('orderForm').addEventListener('submit', function(event) {
        event.preventDefault();
        if (validateForm()) {
            this.submit();
        }
    });
});

function loadBranches() {
    fetch('/api/branches')
    .then(response => response.json())
    .then(branches => {
        const branchSelect = document.getElementById('branchSelect');
        // 기존 옵션 초기화 및 "지점을 선택해주세요" 옵션 추가
        branchSelect.innerHTML = '<option disabled selected value="">지점을 선택해주세요</option>';
        
        branches.forEach(branch => {
            // 지점 옵션 추가
            const option = new Option(branch.name, branch.id);
            branchSelect.appendChild(option);
        });

        // 지점 선택 시 이메일 드롭다운 업데이트
        branchSelect.addEventListener('change', () => updateEmailOptions(branches));
    })
    .catch(error => console.error('Error loading branches:', error));
}

function updateEmailOptions(branches) {
    const branchSelect = document.getElementById('branchSelect');
    const emailSelect = document.getElementById('emailSelect');
    const selectedBranchId = branchSelect.value;

    // 이메일 드롭다운 초기화 및 기본 옵션 추가
    emailSelect.innerHTML = '<option disabled selected value="">이메일을 선택해주세요</option>';

    // 선택된 지점에 해당하는 이메일을 찾아 이메일 드롭다운 업데이트
    const selectedBranch = branches.find(branch => branch.id.toString() === selectedBranchId);
    if (selectedBranch && selectedBranch.email) {
        const emailOption = new Option(selectedBranch.email, selectedBranch.email);
        emailSelect.appendChild(emailOption);
    }
}

// 전역 변수로 주문 항목의 인덱스를 관리합니다.
let orderItemIndex = 1;

function addOrderItem() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            const orderItemsDiv = document.getElementById('orderItems');
            const div = document.createElement('div');
            div.classList.add('orderItem', 'mb-3');

            // 주문 항목 타이틀 추가
            const itemTitle = document.createElement('h5');
            itemTitle.innerText = `품목 ${orderItemIndex++}`;
            div.appendChild(itemTitle);

            const productSelect = document.createElement('select');
            productSelect.name = 'product_id[]';
            productSelect.classList.add('form-control', 'productSelect', 'mb-2');

            // "품목을 선택해주세요" 기본 옵션 추가
            const defaultProductOption = new Option('품목을 선택해주세요', '');
            defaultProductOption.disabled = true;
            defaultProductOption.selected = true;
            productSelect.appendChild(defaultProductOption);

            // products.forEach(product => {
            //     const option = new Option(product.name, product.id);
            //     productSelect.appendChild(option);
            // });

            products.forEach(product => {
                // Option의 value에 품목 id와 name을 포함하는 구조로 변경. 구분자 '|' 사용
                const optionValue = `${product.id}|${product.name}`;
                const option = new Option(product.name, optionValue);
                productSelect.appendChild(option);
            });

            productSelect.addEventListener('change', function() {
                loadColors(this, this.nextElementSibling);
            });

            const colorSelect = document.createElement('select');
            colorSelect.name = 'color[]';
            colorSelect.classList.add('form-control', 'colorSelect', 'mb-2');

            // "색상을 선택해주세요" 기본 옵션 추가
            const defaultColorOption = new Option('색상을 선택해주세요', '');
            defaultColorOption.disabled = true;
            defaultColorOption.selected = true;
            colorSelect.appendChild(defaultColorOption);

            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.name = 'quantity[]';
            quantityInput.classList.add('form-control', 'quantityInput', 'mb-2');
            quantityInput.placeholder = "수량"; // placeholder 사용
            quantityInput.min = 1;
            quantityInput.required = true;

            div.appendChild(productSelect);
            div.appendChild(colorSelect);
            div.appendChild(quantityInput);
            orderItemsDiv.appendChild(div);

            // 기본 제품의 색상 로드
            loadColors(productSelect, colorSelect);
        })
        .catch(error => console.error('Error loading products:', error));
}

// 주문 항목 제거하는 함수
function removeLastOrderItem() {
    const orderItemsDiv = document.getElementById('orderItems');
    // 마지막 주문 항목을 찾음
    const lastOrderItem = orderItemsDiv.lastElementChild;
    // 마지막 주문 항목이 있으면 제거
    if (lastOrderItem) {
        orderItemsDiv.removeChild(lastOrderItem);
    }
}

function loadColors(productSelect, colorSelect) {
    // 제품 선택에 따른 색상 로드 로직 유지
    const productName = productSelect.options[productSelect.selectedIndex].text;
    fetch(`/api/colors/${productName}`)
        .then(response => response.json())
        .then(colors => {
            colorSelect.innerHTML = '';
            const defaultColorOption = new Option('색상을 선택해주세요', '');
            defaultColorOption.disabled = true;
            defaultColorOption.selected = true;
            colorSelect.appendChild(defaultColorOption);

            colors.forEach(color => {
                const option = new Option(color, color);
                colorSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading colors:', error));
}

function validateForm() {
    // 이메일 드롭다운의 유효성 검사로 변경
    const email = document.getElementById('emailSelect').value.trim();
    if (!email) {
        alert('이메일을 선택해주세요.');
        return false;
    }
    // 필요한 추가적인 유효성 검사가 있다면 여기에 구현
    return true; // 모든 검사를 통과했다면 true 반환
}


function checkFormInputs() {
    const orderDate = document.getElementById('orderDate').value;
    const branchSelect = document.getElementById('branchSelect').value;
    const emailSelect = document.getElementById('emailSelect').value;
    const specialNote = document.getElementById('specialNoteTextarea').value; // 선택 사항이지만 폼에 포함되어 있습니다.
    const orderItems = document.querySelectorAll('#orderItems .orderItem');
    const submitOrderBtn = document.getElementById('submitOrderBtn');

    let allFilled = orderDate && branchSelect && emailSelect; // 기본 필드 검사

    // 주문 항목 검사: 최소 한 개 이상이 있고, 각 항목의 내용이 채워져야 합니다.
    if(orderItems.length > 0) {
        orderItems.forEach(item => {
            const productSelect = item.querySelector('.productSelect').value;
            const colorSelect = item.querySelector('.colorSelect').value;
            const quantityInput = item.querySelector('.quantityInput').value;
            if(!productSelect || !colorSelect || !quantityInput) {
                allFilled = false; // 주문 항목 중 하나라도 누락된 정보가 있으면 false
            }
        });
    } else {
        allFilled = false; // 주문 항목이 없으면 false
    }

    // 모든 조건이 충족되면 버튼 활성화
    if (allFilled) {
        submitOrderBtn.disabled = false;
        submitOrderBtn.classList.add('btn-primary');
        submitOrderBtn.classList.remove('btn-light');
    } else {
        submitOrderBtn.disabled = true;
        submitOrderBtn.classList.remove('btn-primary');
        submitOrderBtn.classList.add('btn-light');
    }
}