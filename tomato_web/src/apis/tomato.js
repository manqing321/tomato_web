import http_instance from "@/utils/http"

function get_tomatoes() {
    return http_instance({
        url: "tomato/read_tomatoes/",
    })
}

function create_tomato(data) {
    return http_instance({
        url: "tomato/create_tomato/",
        method: "post",
        data: data,
    })
}

function delete_tomato(data) {
    return http_instance({
        url: "tomato/delete_tomato/",
        method: "delete",
        params: data,
    })
}

function update_tomato(tomato_id, data) {
    return http_instance({
        url: `tomato/update_tomato/${tomato_id}`,
        method: "patch",
        data: data,
    })
}

function stat_name() {
    return http_instance({
        url: "tomato/stat_name/",
    })
}
function stat_day() {
    return http_instance({
        url: "tomato/stat_day/",
    })
}

function stat_month() {
    return http_instance({
        url: "tomato/stat_month/",
    })
}

export { get_tomatoes, create_tomato, delete_tomato, update_tomato, stat_name, stat_day, stat_month }